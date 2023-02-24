import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import useKeplrConnect from "../hooks/use-keplr-connect";
import { chainState, keplrInteractedState, keplrState } from "../state/cosmos";

export default function KeplrWatcher() {
  const chain = useRecoilValue(chainState);
  const keplrInteracted = useRecoilValue(keplrInteractedState);
  const [, setKeplr] = useRecoilState(keplrState);

  const connect = useKeplrConnect();

  useEffect(() => {
    setKeplr((keplr) => ({
      ...keplr,
      initialized: true,
      isInstalled: Boolean(window.keplr),
    }));
  }, [setKeplr]);

  useEffect(() => {
    if (!keplrInteracted) {
      return;
    }

    connect();
  }, [chain, keplrInteracted, connect]);

  useEffect(() => {
    window.addEventListener("keplr_keystorechange", connect);

    return () => {
      window.removeEventListener("keplr_keystorechange", connect);
    };
  }, [connect]);

  return null;
}
