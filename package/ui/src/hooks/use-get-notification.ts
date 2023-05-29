import { useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";

import { signClientState, keplrState } from "../state/cosmos";
import { selectedDensState } from "../state/howlpack";
import useTryNextClient from "./use-try-next-client";

export default function useGetNotification() {
  const keplr = useRecoilValue(keplrState);
  const signClient = useRecoilValue(signClientState);
  const tryNextClient = useTryNextClient();
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));

  return useQuery<any>(
    ["get_notifications", keplr.account, selectedDens],
    async () => {
      if (!signClient) {
        return [];
      }

      const notifications = await signClient.queryContractSmart(
        import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
        {
          get_notifications: { token_id: selectedDens },
        }
      );

      return notifications;
    },
    {
      enabled: Boolean(signClient),
      staleTime: 3000000,
      onError: tryNextClient,
      suspense: true,
    }
  );
}
