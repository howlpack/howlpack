import { Box, Typography } from "@mui/material";
import { Fragment } from "react";
import Email from "./email";
import SelectEventType from "./select-event-type";

export default function EmailForm({
  formState,
  onChange,
  disabled = false,
}: {
  formState: any;
  onChange: any;
  disabled?: boolean;
}) {
  return (
    <Fragment>
      <Typography variant="caption">
        Enter the email address where you want to receive Howl notifications:
      </Typography>
      <Box sx={{ maxWidth: "450px", mt: 1 }}>
        <Email formData={formState} onChange={onChange} disabled={disabled} />
      </Box>

      <Box>
        <SelectEventType
          formData={formState}
          onChange={onChange}
          disabled={disabled}
        />
      </Box>
    </Fragment>
  );
}
