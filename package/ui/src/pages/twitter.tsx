import { Button, Card, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useCallback, useMemo, useState } from "react";
import { selectedDensState } from "../state/howlpack";
import { useRecoilState, useRecoilValue } from "recoil";
import { keplrState, chainState } from "../state/cosmos";
import { snackbarState } from "../state/snackbar";
import { StdSignature } from "@keplr-wallet/types";

export default function Twitter() {
  const chain = useRecoilValue(chainState);
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const [, setSnackbar] = useRecoilState(snackbarState);

  const messageToSign = useMemo(() => {
    return btoa(
      JSON.stringify({
        address: keplr.account,
        dens_name: selectedDens,
      })
    );
  }, [keplr.account, selectedDens]);

  const [signature, setSignature] = useState<StdSignature | undefined>();

  const sign = useCallback(async () => {
    if (!keplr.account) {
      setSnackbar({
        message: "Keplr not connected",
      });
      return;
    }

    const signature = await window.keplr?.signArbitrary(
      chain.chainId,
      keplr.account,
      messageToSign
    );

    setSignature(signature);
  }, [keplr.account, messageToSign, chain, setSnackbar]);

  const twitterRedirectUrl = useMemo(() => {
    if (!signature) {
      return null;
    }

    const url = new URL(
      "/api/twitter/redirect",
      import.meta.env.VITE_BACKEND_URL
    );

    url.searchParams.append("message", messageToSign);
    url.searchParams.append("pubKey", signature.pub_key.value);
    url.searchParams.append("signature", signature.signature);

    return url;
  }, [signature, messageToSign]);

  return (
    <Fragment>
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h6">
            Connect your Howl <b>{selectedDens}</b> with your Twitter account
          </Typography>
        </Box>

        <Divider sx={{ mt: 1, mb: 4 }} />

        <Box pb={2}>
          <Typography variant="body1">
            With Howl's integration with Twitter, the process of sending your
            Howl message as a tweet is completely automated. This means you
            don't have to manually post your message on Twitter; Howl takes care
            of it for you.
          </Typography>
        </Box>
        <Box py={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            1. Sign an Arbitrary Message
          </Typography>
          <Divider sx={{ mt: 1, mb: 2 }} />
          <Typography variant="body2">
            To get started, you'll need to sign an arbitrary message as proof
            that you are the rightful owner of the address.
          </Typography>
          <Button
            sx={{ my: 2 }}
            color="secondary"
            variant="contained"
            onClick={() => sign()}
            disableElevation
          >
            Sign the message
          </Button>
        </Box>

        <Box py={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            2. Authorize the Application on Twitter
          </Typography>
          <Divider sx={{ mt: 1, mb: 2 }} />
          <Typography variant="body2">
            After successfully signing the arbitrary message, the next step is
            to authorize the Howl application on your Twitter account.
          </Typography>

          <Button
            sx={{ my: 2 }}
            color="secondary"
            variant="contained"
            href={twitterRedirectUrl?.toString()}
            disableElevation
            disabled={!twitterRedirectUrl}
          >
            Authorize
          </Button>
        </Box>
      </Card>
    </Fragment>
  );
}
