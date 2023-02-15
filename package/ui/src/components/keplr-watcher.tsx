import { useEffect } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { keplrState } from "../state/cosmos";

export default function KeplrWatcher() {
  const [keplr, setKeplr] = useRecoilState(keplrState);

  useEffect(() => {
    setKeplr((keplr) => ({
      ...keplr,
      initialized: true,
      isInstalled: Boolean(window.keplr),
    }));
  }, [setKeplr]);

  useEffect(() => {
    function keplrKeystoreChange() {
      console.log(
        "Key store in Keplr is changed. You may need to refetch the account info."
      );
    }
    window.addEventListener("keplr_keystorechange", keplrKeystoreChange);

    return () => {
      window.removeEventListener("keplr_keystorechange", keplrKeystoreChange);
    };
  }, []);

  return null;
}
