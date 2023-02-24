import { Box, Button, Typography } from "@mui/material";
import { Fragment } from "react";
import { useMutation } from "react-query";
import useFormData from "../../hooks/use-form-data";
import Email from "./components/email";
import { url, fetchThrowHttpError } from "@howlpack/howlpack-shared";

export default function EmailNotifications() {
  const { formState, onChange } = useFormData({ email: "" });

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

          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              mutate();
            }}
            disableElevation
          >
            Encrypt the email
          </Button>
        </Box>
      </Box>
    </Fragment>
  );
}
