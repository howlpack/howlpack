import { Divider, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { constants } from "@howlpack/howlpack-shared";
import {
  composeReplyWebhook,
  composeFollowerWebhook,
  composeLikesWebhook,
  composeMentionedWebhook,
  composeMyHowlWebhook,
} from "@howlpack/howlpack-processor/webhook.js";
import { useState } from "react";
import { labels } from "./select-event-type";
import { selectedDensState } from "../../../state/howlpack";
import { keplrState } from "../../../state/cosmos";
import { useRecoilValue } from "recoil";

const examples = [
  (dens: string | null) => ({
    event_type: constants.EVENT_TYPES.NEW_FOLLOWER,
    ...composeFollowerWebhook(dens, "howlpack"),
  }),
  (dens: string | null) => ({
    event_type: constants.EVENT_TYPES.NEW_REPLY,
    ...composeReplyWebhook(dens, "howlpack", "post-uuid", "reply-uuid"),
  }),
  (dens: string | null) => ({
    event_type: constants.EVENT_TYPES.NEW_LIKE,
    ...composeLikesWebhook(dens, "post-uuid", "100", "howlpack"),
  }),
  (dens: string | null) => ({
    event_type: constants.EVENT_TYPES.NEW_MENTION,
    ...composeMentionedWebhook(dens, "howlpack", "post-uuid"),
  }),
  (dens: string | null) => ({
    event_type: constants.EVENT_TYPES.MY_HOWL,
    ...composeMyHowlWebhook(dens, "post-uuid"),
  }),
];

export default function WebhookExample() {
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const [selectedExampleId, setSelectedExampleId] = useState(0);
  return (
    <Box sx={{ background: "#efefef", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Select
          size="small"
          labelId="dens-select-label"
          value={selectedExampleId}
          onChange={(event: any) => {
            setSelectedExampleId(event.target.value);
          }}
          sx={{ mr: 2 }}
        >
          {examples.map((e, ix) => (
            <MenuItem key={ix} value={ix}>
              {labels[e(selectedDens).event_type]}
            </MenuItem>
          ))}
        </Select>
        <Typography variant="caption">Example Webhook body</Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <pre style={{ overflowX: "scroll" }}>
        POST{" "}
        {JSON.stringify(examples[selectedExampleId](selectedDens), null, 4)}
      </pre>
    </Box>
  );
}
