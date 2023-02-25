import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { Fragment, useMemo } from "react";
import { useMutation } from "react-query";
import useFormData from "../../../hooks/use-form-data";
import Email, { emailValidator } from "./email";
import { url, fetchThrowHttpError, constants } from "@howlpack/howlpack-shared";
import SelectEventType from "./select-event-type";
import Joi from "joi";
import { useRecoilValue } from "recoil";
import { clientState, keplrState } from "../../../state/cosmos";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { toUtf8 } from "@cosmjs/encoding";
import { selectedDensState } from "../../../state/howlpack";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const subscribeValidator = Joi.object({
  email: emailValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function EmailForm() {
  const { formState, onChange } = useFormData({
    email: "",
    event_types: initialEventTypes,
  });

  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const client = useRecoilValue(clientState);

  const { data: encryptedEmail, mutate } = useMutation(
    ["/api/crypto/encrypt", formState.get("email")],
    () =>
      fetch(
        url.backendUrl("/api/crypto/encrypt", import.meta.env.VITE_BACKEND_URL),
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: formState.get("email"),
          }),
          method: "post",
        }
      )
        .then(fetchThrowHttpError)
        .then((res) => res.text())
  );

  const { data: updateNotificationsData, mutate: updateNotifications } =
    useMutation<DeliverTxResponse | null>(["notifications"], async () => {
      if (!client) {
        return null;
      }

      if (!keplr.account) {
        return null;
      }

      const updateMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: keplr.account,
          contract: import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
          msg: toUtf8(
            JSON.stringify({
              update_notifications: {
                token_id: selectedDens,
                notifications: [
                  {
                    email: {
                      masked_addr: "masked_addr",
                      encoded_addr: "encoded_addr",
                      preferences: "1",
                    },
                  },
                ],
              },
            })
          ),

          funds: [],
        }),
      };

      return await client.signAndBroadcast(keplr.account, [updateMsg], {
        amount: [{ amount: "0.025", denom: "ujuno" }],
        gas: "300000",
      });
    });

  const subscribeEnabled = useMemo<boolean>(() => {
    return subscribeValidator.validate(formState.toJSON()).error == null;
  }, [formState]);

  return (
    <Fragment>
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Typography variant="h6">
          Subscribe to {selectedDens} Howl events
        </Typography>
        <Divider sx={{ mt: 1, mb: 4 }} />

        <Typography variant="caption">
          Enter the email address where you want to receive Howl notifications:
        </Typography>
        <Box sx={{ maxWidth: "450px", mt: 1 }}>
          <Email formData={formState} onChange={onChange as any} />
        </Box>

        <Box>
          <SelectEventType formData={formState} onChange={onChange} />
        </Box>

        <Box>
          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={async () => {
              await mutate();
              await updateNotifications();
            }}
            disableElevation
            disabled={!subscribeEnabled}
          >
            Subscribe
          </Button>
        </Box>
      </Card>
    </Fragment>
  );
}
