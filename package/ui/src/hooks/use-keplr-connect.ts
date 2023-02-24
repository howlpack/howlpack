import { useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { chainState, keplrInteractedState, keplrState } from "../state/cosmos";

export default function useKeplrConnect() {
  const chain = useRecoilValue(chainState);
  const [, setKeplr] = useRecoilState(keplrState);
  const [, setKeplrInteracted] = useRecoilState(keplrInteractedState);

  return useCallback(async () => {
    if (!window.keplr) {
      return;
    }

    await window.keplr.enable(chain.chainId);

    if (!window.getOfflineSigner) {
      return;
    }

    const offlineSigner = window.getOfflineSigner(chain.chainId);
    const accounts = await offlineSigner.getAccounts();
    const key = await window.keplr.getKey(chain.chainId);

    setKeplrInteracted(true);

    setKeplr((s) => ({
      ...s,
      account: accounts[0].address,
      name: key.name,
    }));
  }, [chain.chainId, setKeplrInteracted, setKeplr]);
}
