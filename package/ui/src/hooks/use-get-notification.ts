import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { clientState, keplrState } from "../state/cosmos";
import { selectedDensState } from "../state/howlpack";
import useTryNextClient from "./use-try-next-client";

export default function useGetNotification() {
  const keplr = useRecoilValue(keplrState);
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));

  return useQuery<any>(
    ["get_notifications", keplr.account, selectedDens],
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
      staleTime: 3000000,
      onError: tryNextClient,
      suspense: true,
    }
  );
}
