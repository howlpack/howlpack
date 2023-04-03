import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import { clientState } from "../state/cosmos";
import useTryNextClient from "./use-try-next-client";

export default function useJunoHeight(opts?: Parameters<typeof useQuery>[2]) {
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();

  return useQuery<number | null>(
    ["juno_height"],
    async () => {
      if (!client) {
        return null;
      }

      const height = await client.getHeight();

      return height;
    },
    {
      enabled: Boolean(client),
      staleTime: 6000,
      onError: tryNextClient,
      ...(opts as any),
    }
  );
}
