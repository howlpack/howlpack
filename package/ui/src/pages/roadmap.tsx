import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";

export default function FAQ() {
  return (
    <Fragment>
      <Box py={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🧪 Webhook notifications [beta]
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body2">
          With this feature, you'll be able to connect your Howl activity to
          external automation systems such as zapier.com or make.com, allowing
          you to seamlessly integrate whatever services you need. We believe
          this new feature will greatly enhance your experience with Howl and we
          can't wait to see what you'll create with it. Stay tuned for more
          updates!
        </Typography>
      </Box>
      <Box py={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🧪 Email notifications [beta]
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body2">
          This feature allows you to connect your Howl activity with your email,
          receiving alerts when there is a new reply, follower, like or mention
          on your post. Now you can stay up-to-date with your Howl activity,
          even when you are away from the platform
        </Typography>
      </Box>
    </Fragment>
  );
}
