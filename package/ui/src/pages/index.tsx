import { Box } from "@mui/system";
import { Fragment } from "react";
import { notification, constants } from "@howlpack/howlpack-shared";

export default function Root() {
  const a = notification.encodePreference([
    constants.EVENT_TYPES.NEW_FOLLOWER,
    constants.EVENT_TYPES.NEW_REPLY,
  ]);

  console.log(a);
  return (
    <Fragment>
      <Box py={2}>ROOT</Box>
    </Fragment>
  );
}
