import { Box, Button, Typography } from "@mui/material";
import { Fragment } from "react";
import useFormData from "../../hooks/use-form-data";
import Email from "./components/email";

export function EmailNotifications() {
  const [formData, setFormData, onChange] = useFormData({ email: "" });

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
          <Email formData={formData} onChange={onChange as any} />

          <Button
            color="secondary"
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => console.log(import.meta.env.VITE_BACKEND_URL)}
            disableElevation
          >
            Encrypt the email
          </Button>
        </Box>
      </Box>
    </Fragment>
  );
}
