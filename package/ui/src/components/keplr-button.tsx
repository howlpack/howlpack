import { Button } from "@mui/material";
import { useRecoilValue } from "recoil";
import { keplrState } from "../state/cosmos";
import Loading from "./loading";
import useKeplrConnect from "../hooks/use-keplr-connect";

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
  const connect = useKeplrConnect();

  return (
    <Button
      color="bluegreen"
      variant="contained"
      disableElevation
      onClick={connect}
      sx={{ color: "white" }}
    >
      Connect Wallet
    </Button>
  );
}

export default function KeplrButton() {
  const keplr = useRecoilValue(keplrState);

  if (!keplr.initialized) {
    return <Loading />;
  }

  if (!keplr.isInstalled) {
    return <InstallButton />;
  }

  if (!keplr.account) {
    return <ConnectButton />;
  }

  return null;
}
