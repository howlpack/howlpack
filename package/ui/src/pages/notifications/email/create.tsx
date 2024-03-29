import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useMemo } from "react";
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
import EmailForm from "../components/email-form";
import { emailValidator } from "../components/email";
import { snackbarState } from "../../../state/snackbar";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const subscribeValidator = Joi.object({
  email: emailValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function EmailCreate() {
  const navigate = useNavigate();
  const { data: notifications } = useGetNotification();
  const queryClient = useQueryClient();
  const emailNotification = useMemo(() => {
    return notifications?.find((n: any) => n.email)?.email;
  }, [notifications]);

  useEffect(() => {
    if (emailNotification) {
      navigate("/notifications/email/update");
    }
  }, [emailNotification, navigate]);

  const { formState, onChange } = useFormData({
    email: "",
    event_types: initialEventTypes,
  });

  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const signClient = useRecoilValue(signClientState);

  const { mutateAsync: encryptEmail, isLoading: isEncryptLoading } =
    useMutation(["/api/crypto/encrypt", formState.get("email")], async () =>
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

  const { mutateAsync: updateNotifications, isLoading: isUpdateLoading } =
    useMutation<DeliverTxResponse | null, unknown, string>(
      ["notifications"],
      async (encryptedEmail) => {
        if (!signClient) {
          return null;
        }

        if (!keplr.account) {
          return null;
        }

        const masked_addr: string = notification.maskAddr(
          formState.get("email")
        );
        const preferences = notification.encodePreference(
          Object.entries(formState.get("event_types"))
            .filter(([, selected]) => selected)
            .map(([p]) => p)
        );

        const newNotification = {
          email: {
            masked_addr: masked_addr,
            encoded_addr: encryptedEmail,
            preferences: preferences,
          },
        };

        const updatedNotifications = notifications.concat(newNotification);

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
        Subscribe to {selectedDens} Howl events
      </Typography>
      <Divider sx={{ mt: 1, mb: 4 }} />

      <EmailForm formState={formState} onChange={onChange} />

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

        {emailNotification && (
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
        )}
      </Box>
    </Card>
  );
}
