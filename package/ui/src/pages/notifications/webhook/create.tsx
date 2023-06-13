import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Fragment, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { toUtf8 } from "@cosmjs/encoding";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  url,
  fetchThrowHttpError,
  constants,
  notification,
} from "@howlpack/howlpack-shared";
import useFormData from "../../../hooks/use-form-data";
import useGetNotification from "../../../hooks/use-get-notification";
import { signClientState, keplrState } from "../../../state/cosmos";
import { selectedDensState } from "../../../state/howlpack";
import Joi from "joi";
import { snackbarState } from "../../../state/snackbar";
import WebhookForm from "../components/webhook-form";
import { urlValidator } from "../components/url";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const subscribeValidator = Joi.object({
  url: urlValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function WebhookCreate() {
  const navigate = useNavigate();
  const { data: notifications } = useGetNotification();
  const queryClient = useQueryClient();

  const { formState, onChange } = useFormData({
    url: "",
    event_types: initialEventTypes,
  });

  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const signClient = useRecoilValue(signClientState);

  const { mutateAsync: encryptEmail, isLoading: isEncryptLoading } =
    useMutation(["/api/crypto/encrypt", formState.get("url")], async () =>
      fetch(
        url.backendUrl("/api/crypto/encrypt", import.meta.env.VITE_BACKEND_URL),
        {
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: formState.get("url"),
          }),
          method: "post",
        }
      )
        .then(fetchThrowHttpError)
        .then((res) => res.text())
    );

  const { mutateAsync: updateNotifications, isLoading: isUpdateLoading } =
    useMutation<DeliverTxResponse | null, unknown, string>(
      ["notifications"],
      async (encryptedUrl) => {
        if (!signClient) {
          return null;
        }

        if (!keplr.account) {
          return null;
        }

        const masked_url: string = notification.maskUrl(formState.get("url"));
        const preferences = notification.encodePreference(
          Object.entries(formState.get("event_types"))
            .filter(([, selected]) => selected)
            .map(([p]) => p)
        );

        const newNotification = {
          webhook: {
            masked_url: masked_url,
            encoded_url: encryptedUrl,
            preferences: preferences,
          },
        };

        const updatedNotifications = notifications
          .filter((n: any) => n?.webhook?.encoded_url !== encryptedUrl)
          .concat(newNotification);

        const updateMsg = {
          typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
          value: MsgExecuteContract.fromPartial({
            sender: keplr.account,
            contract: import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
            msg: toUtf8(
              JSON.stringify({
                update_notifications: {
                  token_id: selectedDens,
                  notifications: updatedNotifications,
                },
              })
            ),

            funds: [],
          }),
        };

        const result = await signClient.signAndBroadcast(
          keplr.account,
          [updateMsg],
          {
            amount: [{ amount: "0.075", denom: "ujuno" }],
            gas: "400000",
          }
        );

        queryClient.setQueryData(
          ["get_notifications", keplr.account],
          updatedNotifications
        );

        return result;
      }
    );

  const subscribeEnabled = useMemo<boolean>(() => {
    return subscribeValidator.validate(formState.toJSON()).error == null;
  }, [formState]);

  const [, setSnackbar] = useRecoilState(snackbarState);

  const inProgress = isEncryptLoading || isUpdateLoading;
  return (
    <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
      <Typography variant="h6">
        Create Webhook subscribed to {selectedDens} Howl events
      </Typography>
      <Divider sx={{ mt: 1, mb: 4 }} />

      <WebhookForm formState={formState} onChange={onChange} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          color="secondary"
          variant="contained"
          sx={{ mt: 2 }}
          onClick={async () => {
            const encryptedEmail = await encryptEmail();
            if (!encryptedEmail) {
              setSnackbar({ message: "Encrypting email failed" });
              return;
            }
            setSnackbar({ message: "Please confirm the transaction" });
            try {
              await updateNotifications(encryptedEmail);

              setSnackbar({
                message: `Email notification for ${selectedDens} successfully created`,
              });
              navigate("../");
            } catch (e: any) {
              setSnackbar({
                message: "Error creating notifications: " + e.message,
              });
            }
          }}
          disableElevation
          disabled={!subscribeEnabled || inProgress}
        >
          {inProgress ? (
            <Fragment>
              <CircularProgress size={15} sx={{ mr: 1 }} /> Loading
            </Fragment>
          ) : (
            "Subscribe"
          )}
        </Button>

        <Button
          color="secondary"
          variant="text"
          sx={{ mt: 2 }}
          onClick={() => {
            navigate("../");
          }}
          disableElevation
          disabled={inProgress}
        >
          Cancel
        </Button>
      </Box>
    </Card>
  );
}
