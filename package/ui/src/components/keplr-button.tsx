import { Button } from "@mui/material";
// import { SigningStargateClient } from "@cosmjs/stargate";
import { useRecoilValue } from "recoil";
import { chainState, keplrState } from "../state/cosmos";
import { useCallback } from "react";

function InstallButton() {
  return (
    <Button
      color="bluegreen"
      variant="outlined"
      href="https://www.keplr.app/"
      rel="noreferrer"
    >
      Install Keplr
    </Button>
  );
}

function ConnectButton() {
  const chain = useRecoilValue(chainState);
  const keplr = useRecoilValue(keplrState);

  const click = useCallback(async () => {
    if (!window.keplr) {
      return;
    }

    await window.keplr.enable(chain.chainId);

    if (!window.getOfflineSigner) {
      return;
    }

    const offlineSigner = window.getOfflineSigner(chain.chainId);
    const accounts = await offlineSigner.getAccounts();

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    // const client = await SigningStargateClient.connectWithSigner(
    //   "https://rpc-juno.itastakers.com/",
    //   offlineSigner
    // );
  }, [chain.chainId]);

  return (
    <Button color="bluegreen" variant="outlined" onClick={click}>
      Connect Wallet
    </Button>
  );
}

export default function KeplrButton() {
  const chainId = "juno-1";

  const click = async () => {
    if (!window.keplr) {
      return;
    }
    await window.keplr.enable(chainId);

    if (!window.getOfflineSigner) {
      return;
    }

    const offlineSigner = window.getOfflineSigner(chainId);

    // Initialize the gaia api with the offline signer that is injected by Keplr extension.
    // const client = await SigningStargateClient.connectWithSigner(
    //   "https://rpc-juno.itastakers.com/",
    //   offlineSigner
    // );
  };

  return (
    <Button color="bluegreen" variant="outlined" onClick={click}>
      Connect Wallet
    </Button>
  );
}
