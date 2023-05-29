import { Avatar, Box, Divider, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { PostInfo } from "../../../types/types";

const SECOND = 1000 * 60;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function relativeTime(timestamp: number) {
  const now = Date.now();
  const diff = timestamp - now;
  const days = diff / DAY;
  const hours = (diff % DAY) / MINUTE;
  const minutes = (diff % MINUTE) / SECOND;
  const seconds = (diff % SECOND) / 1000;
  const relative = new Intl.RelativeTimeFormat();

  if (diff > 0) {
    // If the difference is positive, the timestamp is in the future
    if (days >= 1) {
      return `${relative.format(Math.round(days), "day")}`;
    }
    if (hours >= 1) {
      return relative.format(Math.round(hours), "hour");
    }
    if (minutes >= 1) {
      return relative.format(Math.round(minutes), "minute");
    }
    if (seconds >= 0) {
      return relative.format(Math.round(seconds), "second");
    }
  }
  if (diff < 0) {
    // If the difference is negative, the timestamp is in the past
    if (Math.abs(days) >= 1) {
      return relative.format(Math.round(days), "day");
    }
    if (Math.abs(hours) >= 1) {
      return relative.format(Math.round(hours), "hour");
    }
    if (Math.abs(minutes) >= 1) {
      return relative.format(Math.round(minutes), "minute");
    }
    if (Math.abs(seconds) >= 0) {
      return relative.format(Math.round(seconds), "second");
    }
  }
  return "";
}

export default function Post({ post }: { post: PostInfo }) {
  if (!post.post) {
    return null;
  }

  return (
    <Box sx={{ p: 1 }}>
      <Box
        sx={{
          display: "flex",
          gap: 1,
          opacity: 0.8,
          alignItems: "center",
        }}
      >
        <Avatar sx={{ width: 24, height: 24 }}>
          <Typography variant="caption">
            {post.post.creator.slice(0, 1)}
          </Typography>
        </Avatar>
        <Typography variant="caption">{post.post.creator}</Typography>
        <Typography variant="caption">
          {relativeTime(post.post.timestamp * 1000)}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">{post.post.body}</Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          justifyContent: "right",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography variant="caption">{post.reply_count}</Typography>
        </Box>
        {/* <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <FavoriteBorderIcon />
          <Typography variant="caption">
            {Math.ceil(random * 300) / 10}k
          </Typography>
        </Box> */}
      </Box>
    </Box>
  );
}
