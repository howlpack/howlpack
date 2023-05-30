import { Fragment, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { useParams } from "react-router-dom";
import { fetchThrowHttpError } from "@howlpack/howlpack-shared";
import { lcdState } from "../../state/cosmos";
import useTryNextLCDClient from "../../hooks/use-try-next-lcd-client";
import { PostInfo } from "../../types/types";
import Posts from "./components/posts";

export default function Embedded() {
  const params = useParams();
  const lcd = useRecoilValue(lcdState);
  const tryNextLCDClient = useTryNextLCDClient();

  const queryB64 = useMemo(() => {
    const q = {
      list_creator_posts: { creator: params.username },
    };
    return btoa(JSON.stringify(q));
  }, [params.username]);

  const howls = useQuery<PostInfo[]>(
    ["get_howls", params.username],
    async () => {
      const path = `/cosmwasm/wasm/v1/contract/${
        import.meta.env.VITE_HOWL_POSTS
      }/smart/${queryB64}`;

      const d = await fetch(new URL(path, lcd))
        .then(fetchThrowHttpError.default)
        .then((b) => b.json())
        .then((b) => b.data.posts);

      return d;
    },
    {
      enabled: Boolean(queryB64),
      onError: tryNextLCDClient,
      suspense: true,
    }
  );

  return (
    <Fragment>
      {howls.data && <Posts posts={howls.data} creator={params.username} />}
    </Fragment>
  );
}
