import { Box, Divider } from "@mui/material";
import { Fragment } from "react";
import { PostInfo } from "../../../types/types";
import Post from "./post";

export default function Posts({ posts }: { posts: PostInfo[] }) {
  return (
    <Fragment>
      <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}` }}>
        {posts.map((post, ix) => (
          <Fragment key={post.uuid}>
            <Post post={post} />
            {ix !== posts.length - 1 && <Divider />}
          </Fragment>
        ))}
      </Box>
    </Fragment>
  );
}
