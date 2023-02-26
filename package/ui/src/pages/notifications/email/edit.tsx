import { Box, Button, Card, Divider, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
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
import { clientState, keplrState } from "../../../state/cosmos";
import { selectedDensState } from "../../../state/howlpack";
import Joi from "joi";
import Email, { emailValidator } from "../components/email";
import { snackbarState } from "../../../state/snackbar";
import SelectEventType from "../components/select-event-type";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const updateValidator = Joi.object({
  event_types: Joi.object().unknown(true),
}).unknown(true);

const updateEmailValidator = Joi.object({
  email: emailValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function EmailEdit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications } = useGetNotification();
  const emailNotification = useMemo(() => {
    return notifications?.find((n: any) => n.email)?.email;
  }, [notifications]);

  useEffect(() => {
    if (!emailNotification) {
      navigate("/notifications/email/create");
    }
  }, [emailNotification, navigate]);

  const { formState, onChange, setFormState } = useFormData({
    email: "",
    event_types: initialEventTypes,
  });
  const [emailChanged, setEmailChanged] = useState(false);

  useEffect(() => {
    if (emailChanged) {
      setFormState((m) => m.set("email", ""));
    }
  }, [emailChanged, setFormState]);

  useEffect(() => {
    if (!emailNotification) {
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

  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const client = useRecoilValue(clientState);

  const { mutateAsync: encryptEmail } = useMutation(
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

  const { mutateAsync: updateNotifications } = useMutation<
    DeliverTxResponse | null,
    unknown,
    string[]
  >(["notifications"], async ([masked_addr, encryptedEmail]) => {
    if (!client) {
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

    const newNotification = {
      email: {
        masked_addr: masked_addr,
        encoded_addr: encryptedEmail,
        preferences: preferences,
      },
    };

    const updatedNotifications = notifications
      .filter(
        (n: any) => n?.email?.encoded_addr !== emailNotification.encoded_addr
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

    queryClient.setQueryData(
      ["get_notifications", keplr.account],
      updatedNotifications
    );

    return null;
    // return await client.signAndBroadcast(keplr.account, [updateMsg], {
    //   amount: [{ amount: "0.025", denom: "ujuno" }],
    //   gas: "400000",
    // });
  });

  const subscribeEnabled = useMemo<boolean>(() => {
    const validator = emailChanged ? updateEmailValidator : updateValidator;
    return validator.validate(formState.toJSON()).error == null;
  }, [formState, emailChanged]);

  const [, setSnackbar] = useRecoilState(snackbarState);
  const emailInputRef = useRef<any>();

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
      <Typography variant="h6">
        Edit subscription of the {selectedDens} Howl events
      </Typography>
      <Divider sx={{ mt: 1, mb: 4 }} />

      <Box
        sx={{
          maxWidth: "450px",
          mt: 1,
          display: "flex",
        }}
      >
        <Email
          formData={formState}
          onChange={onChange}
          disabled={!emailChanged}
          inputRef={emailInputRef}
        />
        <Button
          variant="outlined"
          sx={{ minWidth: "100px", ml: 1 }}
          onClick={() => {
            setEmailChanged(true);

            setTimeout(() => {
              emailInputRef.current?.focus();
            }, 100);
          }}
          disabled={emailChanged}
        >
          Change
        </Button>
      </Box>

      <Box>
        <SelectEventType formData={formState} onChange={onChange} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button
          color="secondary"
          variant="contained"
          sx={{ mt: 2 }}
          onClick={async () => {
            let masked_addr: string = emailNotification.masked_addr;
            let encryptedEmail: string = emailNotification.encoded_addr;

            if (emailChanged) {
              masked_addr = notification.maskAddr(formState.get("email"));
              encryptedEmail = await encryptEmail();
            }

            if (!encryptedEmail) {
              setSnackbar({ message: "Encrypting email failed" });
              return;
            }
            await updateNotifications([masked_addr, encryptedEmail]);

            setSnackbar({
              message: `Email notification for ${selectedDens} successfully updated`,
            });
            navigate("../");
          }}
          disableElevation
          disabled={!subscribeEnabled}
        >
          Update subscription
        </Button>
        <Button
          color="secondary"
          variant="text"
          sx={{ mt: 2 }}
          onClick={() => {
            navigate("../");
          }}
          disableElevation
        >
          Cancel
        </Button>
      </Box>
    </Card>
  );
}
