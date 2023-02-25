import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import useStargateClient from "./use-stargate-client";
import { keplrState } from "../state/cosmos";
import { selectedDensState } from "../state/howlpack";

export default function useGetNotification() {
  const keplr = useRecoilValue(keplrState);
  const { client, tryNextClient } = useStargateClient();
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));

  return useQuery<any>(
    ["get_notifications", keplr.account, client],
    async () => {
      if (!client) {
        return [];
      }

      const notifications = await client.queryContractSmart(
        import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
        {
          get_notifications: { token_id: selectedDens },
        }
      );

      return notifications;
    },
    {
      enabled: Boolean(client),
      onError: tryNextClient,
      suspense: true,
    }
  );
}
