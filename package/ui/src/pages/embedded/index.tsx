import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { lcdState } from "../../state/cosmos";
import useTryNextLCDClient from "../../hooks/use-try-next-lcd-client";
import { Fragment, useMemo } from "react";
import { fetchThrowHttpError } from "@howlpack/howlpack-shared";
import { PostInfo } from "../../types/types";
import Posts from "./components/posts";

export default function Embedded() {
  const lcd = useRecoilValue(lcdState);
  const tryNextLCDClient = useTryNextLCDClient();

  const queryB64 = useMemo(() => {
    const q = {
      all_posts: { order: "desc" },
    };
    return btoa(JSON.stringify(q));
  }, []);

  const howls = useQuery<PostInfo[]>(
    ["get_howls"],
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

  return <Fragment>{howls.data && <Posts posts={howls.data} />}</Fragment>;
}
