import { Divider, MenuItem, Select, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { constants } from "@howlpack/howlpack-shared";
import { useState } from "react";

const examples = [
  {
    event_type: constants.EVENT_TYPES.NEW_REPLY,
    body: {
      postAuthor: "foobar",
      replyAuthor: "howlpack",
      replyId: "uuid",
    },
  },
  {
    event_type: constants.EVENT_TYPES.NEW_FOLLOWER,
    body: {
      followed: "howlpack",
      follower: "howlpack",
    },
  },
];

export default function WebhookExample() {
  const [selectedExampleId, setSelectedExampleId] = useState(0);
  return (
    <Box sx={{ background: "#efefef", p: 3 }}>
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
            {e.event_type}
          </MenuItem>
        ))}
      </Select>
      <Typography variant="caption">Example Webhook body</Typography>
      <Divider sx={{ my: 2 }} />
      <pre>POST {JSON.stringify(examples[selectedExampleId], null, 4)}</pre>
    </Box>
  );
}
