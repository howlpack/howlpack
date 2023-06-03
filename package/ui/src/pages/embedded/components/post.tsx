import { Avatar, Box, Link, Typography, alpha } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useRecoilValue } from "recoil";
import { Fragment, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchThrowHttpError } from "@howlpack/howlpack-shared";
import { InfoExtension, PostInfo } from "../../../types/types";
import { lcdState } from "../../../state/cosmos";
import useTryNextLCDClient from "../../../hooks/use-try-next-lcd-client";
import { constants } from "@howlpack/howlpack-shared";
import { PostImage } from "./post-image";

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

function relativeTime(timestamp: number) {
  const now = Date.now();
  const diff = timestamp - now;
  const days = diff / DAY;
  const hours = (diff % DAY) / HOUR;
  const minutes = (diff % MINUTE) / MINUTE;
  const seconds = (diff % SECOND) / 1000;
  const relative = new Intl.RelativeTimeFormat();

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

const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

function renderText(txt: string) {
  return txt.split(" ").map((part) =>
    URL_REGEX.test(part) ? (
      <Fragment key={part}>
        <Link
          href={part}
          target="_blank"
          color={"primary"}
          onClick={(event) => event.stopPropagation()}
        >
          {part}
        </Link>{" "}
      </Fragment>
    ) : (
      part + " "
    )
  );
}

export default function Post({ post }: { post: PostInfo }) {
  if (!post.post) {
    return null;
  }

  return (
    <Box
      sx={{
        p: 1,
        cursor: "pointer",
        transition: "background 0.2s linear",
        "&:hover": {
          background: (theme) => alpha(theme.palette.divider, 0.05),
        },
      }}
      onClick={() => {
        const post_link = new URL(
          `/${post.post!.creator}/${post.uuid}`,
          constants.HOWL_URL
        ).toString();
        window.open(post_link, "_blank");
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 1,
          opacity: 0.8,
          alignItems: "center",
          justifyItems: "flex-start",
        }}
      >
        <ProfilePicture username={post.post.creator} />
        <Typography variant="caption">
          <Link
            href={new URL(
              `/${post.post!.creator}`,
              constants.HOWL_URL
            ).toString()}
            onClick={(event) => event.stopPropagation()}
            target="_blank"
            color={"inherit"}
          >
            {post.post.creator}
          </Link>
        </Typography>{" "}
        <Typography variant="caption">
          {relativeTime(post.post.timestamp * 1000)}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            marginLeft: "auto",
          }}
        >
          <ChatBubbleOutlineIcon fontSize="small" />
          <Typography variant="caption">{post.reply_count}</Typography>
        </Box>
      </Box>
      <Box sx={{ p: 2, overflowWrap: "anywhere" }}>
        <Typography variant="body1">{renderText(post.post.body)}</Typography>
      </Box>
      <Box>
        {post.post.image_uri && <PostImage image_uri={post.post.image_uri} />}
      </Box>
    </Box>
  );
}
