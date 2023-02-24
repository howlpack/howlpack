import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { chainState, keplrState } from "../state/cosmos";

const JUNO_RPCS = JSON.parse(import.meta.env.VITE_JUNO_RPCS) as string[];

export default function useStargateClient() {
  const [RPCIx, setRPCIx] = useState(0);

  const [client, setClient] = useState<SigningCosmWasmClient | null>(null);
  const chain = useRecoilValue(chainState);
  const keplr = useRecoilValue(keplrState);

  const tryNextClient = useCallback(() => {
    console.log("trying next node");
    setRPCIx((ix) => (ix + 1) % JUNO_RPCS.length);
  }, []);

  useEffect(() => {
    if (!keplr.account) {
      return;
    }

    if (!window.getOfflineSigner) {
      return;
    }

    const offlineSigner = window.getOfflineSigner(chain.chainId);

    SigningCosmWasmClient.connectWithSigner(JUNO_RPCS[RPCIx], offlineSigner)
      .then((c) => {
        setClient(c);
      })
      .catch(() => {
        tryNextClient();
      });
  }, [chain.chainId, keplr, RPCIx, tryNextClient]);

  return { client, tryNextClient };
}
