import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { signClientState } from "../state/cosmos";
import useTryNextClient from "./use-try-next-client";

export function useHowlPrice() {
  const operations = [
    {
      wyndex_swap: {
        offer_asset_info: {
          token:
            "juno1g0wuyu2f49ncf94r65278puxzclf5arse9f3kvffxyv4se4vgdmsk4dvqz",
        },
        ask_asset_info: {
          token:
            "juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        },
      },
    },
    {
      wyndex_swap: {
        offer_asset_info: {
          token:
            "juno1mkw83sv6c7sjdvsaplrzc8yaes9l42p4mhy0ssuxjnyzl87c9eps7ce3m9",
        },
        ask_asset_info: {
          native:
            "ibc/EAC38D55372F38F1AFD68DF7FE9EF762DCF69F26520643CF3F9D292A738D8034",
        },
      },
    },
  ];

  const signClient = useRecoilValue(signClientState);
  const tryNextClient = useTryNextClient();

  return useQuery<string>(
    ["howl_price"],
    async () => {
      if (!signClient) {
        return [];
      }

      const { amount } = await signClient.queryContractSmart(
        "juno1pctfpv9k03v0ff538pz8kkw5ujlptntzkwjg6c0lrtqv87s9k28qdtl50w",
        {
          simulate_swap_operations: {
            offer_amount: "1000000",
            operations,
            referral: false,
          },
        }
      );

      return amount;
    },
    {
      enabled: Boolean(signClient),
      staleTime: 60000,
      onError: tryNextClient,
      suspense: true,
    }
  );
}
