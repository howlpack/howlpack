import { Box, Grid, Typography } from "@mui/material";
import { Fragment } from "react";
import SelectEventType from "./select-event-type";
import UrlInput from "./url";
import WebhookExample from "./webhook-example";

export default function WebhookForm({
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
        Enter the URL address where you want to receive Howl notifications:
      </Typography>
      <Box sx={{ mt: 1 }}>
        <UrlInput
          formData={formState}
          onChange={onChange}
          disabled={disabled}
        />
      </Box>

      <Grid container>
        <Grid xs={12} sm={4} item>
          <SelectEventType
            formData={formState}
            onChange={onChange}
            disabled={disabled}
          />
        </Grid>
        <Grid xs={12} sm={8} item>
          <Box sx={{ mt: 3 }}>
            <WebhookExample />
          </Box>
        </Grid>
      </Grid>
    </Fragment>
  );
}
