import { Box, Button, Divider } from "@mui/material";
import { Fragment } from "react";
import { constants } from "@howlpack/howlpack-shared";
import { PostInfo } from "../../../types/types";
import Post from "./post";

export default function Posts({
  posts,
  creator,
}: {
  posts: PostInfo[];
  creator?: string;
}) {
  return (
    <Fragment>
      <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
        {posts.map((post, ix) => (
          <Fragment key={post.uuid}>
            <Post post={post} />
            {ix !== posts.length - 1 && <Divider />}
          </Fragment>
        ))}
        {creator && (
          <Fragment>
            <Divider />
            <Button
              variant="text"
              fullWidth
              href={new URL(`/${creator}`, constants.HOWL_URL).toString()}
              target="_blank"
            >
              More howls from {creator}
            </Button>
          </Fragment>
        )}
      </Box>
    </Fragment>
  );
}
