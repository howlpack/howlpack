import { Avatar, Box, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useRecoilValue } from "recoil";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchThrowHttpError } from "@howlpack/howlpack-shared";
import { InfoExtension, PostInfo } from "../../../types/types";
import { lcdState } from "../../../state/cosmos";
import useTryNextLCDClient from "../../../hooks/use-try-next-lcd-client";

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

const DENS_ADDR =
  "juno1mf309nyvr4k4zv0m7m40am9n7nqjf6gupa0wukamwmhgntqj0gxs9hqlrr";

function ProfilePicture({ username }: { username: string }) {
  const params = useParams();
  const lcd = useRecoilValue(lcdState);
  const tryNextLCDClient = useTryNextLCDClient();

  const queryB64 = useMemo(() => {
    const q = {
      nft_info: { token_id: username },
    };
    return btoa(JSON.stringify(q));
  }, [username]);

  const nftInfo = useQuery<InfoExtension | null>(
    ["nft_info", params.username],
    async () => {
      const path = `/cosmwasm/wasm/v1/contract/${DENS_ADDR}/smart/${queryB64}`;

      const d = await fetch(new URL(path, lcd))
        .then(fetchThrowHttpError.default)
        .then((b) => b.json())
        .then((b) => b.data.extension);

      return d;
    },
    {
      // to avoid spamming lcd, fetch only if the page has param username
      // that is user-feed page
      enabled: Boolean(params.username) && Boolean(queryB64),
      onError: tryNextLCDClient,
    }
  );

  return (
    <Avatar
      sx={{ width: 24, height: 24 }}
      src={nftInfo.data?.image || undefined}
    >
      <Typography variant="caption">{username.slice(0, 1)}</Typography>
    </Avatar>
  );
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
        <ProfilePicture username={post.post.creator} />
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
