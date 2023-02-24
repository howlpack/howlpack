import { Box, Button, Typography } from "@mui/material";
import { Fragment, useMemo } from "react";
import { useMutation } from "react-query";
import useFormData from "../../hooks/use-form-data";
import Email, { emailValidator } from "./components/email";
import { url, fetchThrowHttpError, constants } from "@howlpack/howlpack-shared";
import SelectEventType from "./components/select-event-type";
import Joi from "joi";
import { snackbarState } from "../../state/snackbar";
import { useRecoilState } from "recoil";

const initialEventTypes = Object.values(
  constants.EVENT_TYPES as { [x: string]: string }
).reduce((acc, k) => ({ ...acc, [k]: true }), {});

const subscribeValidator = Joi.object({
  email: emailValidator,
  event_types: Joi.object().unknown(true),
}).unknown(true);

export default function EmailNotifications() {
  const [, setSnackbar] = useRecoilState(snackbarState);
  const { formState, onChange } = useFormData({
    email: "",
    event_types: initialEventTypes,
  });

  const { data: encryptedEmail, mutate } = useMutation(
    ["/api/crypto/encrypt"],
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

  const subscribeEnabled = useMemo<boolean>(() => {
    return subscribeValidator.validate(formState.toJSON()).error == null;
  }, [formState]);

  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h6">Email preferences</Typography>
        <Typography variant="caption">
          Enter the email address where you want to receive Howl notifications:
        </Typography>
        <Box sx={{ maxWidth: "450px" }}>
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
            onClick={() => {
              setSnackbar({ message: "WOOOHOOO" });
              mutate();
            }}
            disableElevation
            disabled={!subscribeEnabled}
          >
            Subscribe
          </Button>
        </Box>
      </Box>
    </Fragment>
  );
}
