import {
  Box,
  Button,
  Card,
  CircularProgress,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
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
import SelectEventType from "../components/select-event-type";
import UrlInput, { urlValidator } from "../components/url";
import WebhookExample from "../components/webhook-example";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const updateValidator = Joi.object({
  event_types: Joi.object().unknown(true),
}).unknown(true);

const updateUrlValidator = Joi.object({
  url: urlValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function EmailEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications } = useGetNotification();
  const params = useParams();
  const [, setSnackbar] = useRecoilState(snackbarState);

  const webhookId = useMemo(() => {
    if (!params.ix) {
      return null;
    }

    return parseInt(params.ix);
  }, [params]);

  const webhookNotifications = useMemo(() => {
    return notifications?.filter((n: any) => n.webhook);
  }, [notifications]);

  const webhookNotification = useMemo(() => {
    if (webhookId == null) {
      return null;
    }

    return webhookNotifications[webhookId]?.webhook;
  }, [webhookNotifications, webhookId]);

  useEffect(() => {
    if (!webhookNotification) {
      setSnackbar({
        message: "Webhook preferences not found",
      });
      navigate("../");
    }
  }, [webhookNotification, navigate, setSnackbar]);

  const { formState, onChange, setFormState } = useFormData({
    url: "",
    event_types: initialEventTypes,
  });

  const [urlChanged, setUrlChanged] = useState(false);

  useEffect(() => {
    if (urlChanged) {
      setFormState((m) => m.set("url", ""));
    }
  }, [urlChanged, setFormState]);

  useEffect(() => {
    if (!webhookNotification) {
      return;
    }

    const event_types = Object.values(
      constants.EVENT_TYPES as { [x: string]: string }
    ).reduce(
      (acc, k) => ({
        ...acc,
        [k]: notification.hasPreference(webhookNotification.preferences, k),
      }),
      {}
    );

    setFormState((s) => s.set("event_types", event_types));
    setFormState((s) => s.set("url", webhookNotification.masked_url));
  }, [webhookNotification, setFormState]);

  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const signClient = useRecoilValue(signClientState);

  const { mutateAsync: encryptUrl } = useMutation(
    ["/api/crypto/encrypt", formState.get("url")],
    () =>
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
    useMutation<DeliverTxResponse | null, unknown, string[]>(
      ["notifications"],
      async ([masked_url, encryptedUrl]) => {
        if (!signClient) {
          return null;
        }

        if (!keplr.account) {
          return null;
        }

        const preferences = notification.encodePreference(
          Object.entries(formState.get("event_types"))
            .filter(([, selected]) => selected)
            .map(([p]) => p)
        );

        const newNotification: any = {
          webhook: {
            masked_url: masked_url,
            encoded_url: encryptedUrl,
            preferences: preferences,
          },
        };

        const updatedNotifications = notifications
          .filter(
            (n: any) =>
              n?.webhook?.encoded_url !== webhookNotification.encoded_url
          )
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
            amount: [{ amount: "0.025", denom: "ujuno" }],
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
    const validator = urlChanged ? updateUrlValidator : updateValidator;
    return validator.validate(formState.toJSON()).error == null;
  }, [formState, urlChanged]);

  const urlInputRef = useRef<any>();

  const inProgress = isUpdateLoading;

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
      <Typography variant="h6">
        Edit subscription of the {selectedDens} Howl events
      </Typography>
      <Divider sx={{ mt: 1, mb: 4 }} />

      <Box
        sx={{
          mt: 1,
          display: "flex",
        }}
      >
        <UrlInput
          formData={formState}
          onChange={onChange}
          disabled={!urlChanged}
          inputRef={urlInputRef}
        />
        <Button
          variant="outlined"
          sx={{ minWidth: "100px", ml: 1 }}
          onClick={() => {
            setUrlChanged(true);

            setTimeout(() => {
              urlInputRef.current?.focus();
            }, 100);
          }}
          disabled={urlChanged}
        >
          Change
        </Button>
      </Box>

      <Grid container>
        <Grid xs={12} sm={4} item>
          <SelectEventType formData={formState} onChange={onChange} />
        </Grid>
        <Grid xs={12} sm={8} item>
          <Box sx={{ mt: 3 }}>
            <WebhookExample />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          color="secondary"
          variant="contained"
          sx={{ mt: 2 }}
          onClick={async () => {
            let masked_url: string = webhookNotification.masked_url;
            let encryptedUrl: string = webhookNotification.encoded_url;

            if (urlChanged) {
              masked_url = notification.maskUrl(formState.get("url"));
              encryptedUrl = await encryptUrl();
            }

            if (!encryptedUrl) {
              setSnackbar({ message: "Encrypting URL failed" });
              return;
            }

            setSnackbar({ message: "Please confirm the transaction" });
            try {
              await updateNotifications([masked_url, encryptedUrl]);

              setSnackbar({
                message: `URL notification for ${selectedDens} successfully updated`,
              });
              navigate("../");
            } catch (e: any) {
              setSnackbar({
                message: "Error updating notifications: " + e.message,
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
            "Update subscription"
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
