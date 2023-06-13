import { Box, Button, Card, Chip, Divider, Typography } from "@mui/material";
import { Fragment, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Loading from "../../../components/loading";
import { signClientState, keplrState } from "../../../state/cosmos";
import { selectedDensState } from "../../../state/howlpack";
import { useNavigate } from "react-router-dom";
import useGetNotification from "../../../hooks/use-get-notification";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { toUtf8 } from "@cosmjs/encoding";
import { snackbarState } from "../../../state/snackbar";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function WebhookListNotifications() {
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const signClient = useRecoilValue(signClientState);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications } = useGetNotification();

  const webNotifications = useMemo(() => {
    return notifications?.filter((n: any) => n.webhook);
  }, [notifications]);

  const {
    mutateAsync: deleteWebhookNotification,
    isLoading: isClearEmailLoading,
  } = useMutation<DeliverTxResponse | null, unknown, any>(
    ["notifications"],
    async (webhookNotification: any) => {
      if (!signClient) {
        return null;
      }

      if (!keplr.account) {
        return null;
      }

      const updatedNotifications = notifications.filter(
        (n: any) => n?.webhook?.encoded_url !== webhookNotification.encoded_url
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

  const [, setSnackbar] = useRecoilState(snackbarState);

  if (notifications == null) {
    return <Loading></Loading>;
  }

  return (
    <Fragment>
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            Webhook preferences for {selectedDens}
          </Typography>

          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate("create");
            }}
            disableElevation
            disabled={isClearEmailLoading}
          >
            Create new Webhook
          </Button>
        </Box>

        <Divider sx={{ mt: 1, mb: 4 }} />

        {webNotifications.map((n: any, ix: number) => (
          <Fragment key={ix}>
            <Box
              sx={{
                my: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box display={"flex"} alignItems="center">
                <Chip
                  label="POST"
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2">{n.webhook.masked_url}</Typography>
              </Box>

              <Box>
                <Button
                  color="secondary"
                  variant="outlined"
                  sx={{ mr: 2 }}
                  onClick={() => {
                    navigate("./" + ix);
                  }}
                  disabled={isClearEmailLoading}
                >
                  <EditIcon />
                </Button>
                <Button
                  color="secondary"
                  variant="text"
                  onClick={async () => {
                    setSnackbar({ message: "Please confirm the transaction" });

                    try {
                      await deleteWebhookNotification(n.webhook);
                    } catch (e: any) {
                      setSnackbar({
                        message: "Error deleting webhook: " + e.message,
                      });
                    }

                    setSnackbar({
                      message: `Webhook successfully deleted`,
                    });
                  }}
                  disabled={isClearEmailLoading}
                >
                  <DeleteIcon />
                </Button>
              </Box>
            </Box>
            {ix !== webNotifications.length - 1 && (
              <Divider sx={{ opacity: "0.5" }} />
            )}
          </Fragment>
        ))}
      </Card>
    </Fragment>
  );
}
