import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Typography,
} from "@mui/material";
import { Fragment, useCallback, useEffect, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Loading from "../../../components/loading";
import useFormData from "../../../hooks/use-form-data";
import { signClientState, keplrState } from "../../../state/cosmos";
import { selectedDensState } from "../../../state/howlpack";
import { notification, constants } from "@howlpack/howlpack-shared";
import { useNavigate } from "react-router-dom";
import useGetNotification from "../../../hooks/use-get-notification";
import EmailForm from "../components/email-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { toUtf8 } from "@cosmjs/encoding";
import { snackbarState } from "../../../state/snackbar";

export default function EmailNotifications() {
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const signClient = useRecoilValue(signClientState);
  const queryClient = useQueryClient();
  const { formState, setFormState } = useFormData({});
  const navigate = useNavigate();

  const { data: notifications } = useGetNotification();

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const fn_void = useCallback(() => {}, []);

  const emailNotification = useMemo(() => {
    return notifications?.find((n: any) => n.email)?.email;
  }, [notifications]);

  useEffect(() => {
    if (!emailNotification) {
      setFormState((s) => s.clear());

      return;
    }

    const event_types = Object.values(
      constants.EVENT_TYPES as { [x: string]: string }
    ).reduce(
      (acc, k) => ({
        ...acc,
        [k]: notification.hasPreference(emailNotification.preferences, k),
      }),
      {}
    );

    setFormState((s) => s.set("event_types", event_types));
    setFormState((s) => s.set("email", emailNotification.masked_addr));
  }, [emailNotification, setFormState]);

  const {
    mutateAsync: clearEmailNotification,
    isLoading: isClearEmailLoading,
  } = useMutation<DeliverTxResponse | null, unknown>(
    ["notifications"],
    async () => {
      if (!signClient) {
        return null;
      }

      if (!keplr.account) {
        return null;
      }

      const updatedNotifications = notifications.filter(
        (n: any) => n?.email?.encoded_addr !== emailNotification.encoded_addr
      );

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
          amount: [{ amount: "0.025", denom: "ujuno" }],
          gas: "400000",
        }
      );

      queryClient.setQueryData(
        ["get_notifications", keplr.account],
        updatedNotifications
      );

      setFormState((s) =>
        s.merge({
          email: "",
          event_types: {},
        })
      );

      return result;
    }
  );

  const [, setSnackbar] = useRecoilState(snackbarState);

  if (notifications == null) {
    return <Loading></Loading>;
  }

  return (
    <Fragment>
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Typography variant="h6">
          Email preferences for {selectedDens}
        </Typography>

        <Divider sx={{ mt: 1, mb: 4 }} />

        <EmailForm formState={formState} onChange={fn_void} disabled />

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              navigate(emailNotification ? "./update" : "./create");
            }}
            disableElevation
            disabled={isClearEmailLoading}
          >
            Change settings
          </Button>
          {emailNotification && (
            <Button
              color="secondary"
              variant="text"
              sx={{ mt: 2 }}
              onClick={async () => {
                setSnackbar({ message: "Please confirm the transaction" });

                try {
                  await clearEmailNotification();
                } catch (e: any) {
                  setSnackbar({
                    message: "Error clearing notification: " + e.message,
                  });
                }

                setSnackbar({
                  message: `Email notification for ${selectedDens} successfully cleared`,
                });
              }}
              disabled={isClearEmailLoading}
              disableElevation
            >
              {isClearEmailLoading ? (
                <Fragment>
                  <CircularProgress size={15} sx={{ mr: 1 }} /> Loading
                </Fragment>
              ) : (
                "Unsubscribe from all"
              )}
            </Button>
          )}
        </Box>
      </Card>
    </Fragment>
  );
}
