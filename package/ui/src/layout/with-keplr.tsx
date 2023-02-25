import { Card, Divider, Typography } from "@mui/material";
import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { keplrInteractedState, keplrState } from "../state/cosmos";

export default function WithKeplr({ children }: { children?: any }) {
  const keplr = useRecoilValue(keplrState);
  const keplrInteracted = useRecoilValue(keplrInteractedState);

  if (!keplr.initialized) {
    return null;
  }

  if (!keplrInteracted && !keplr.account) {
    return (
      <Fragment>
        <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
          <Typography variant="h5">Hey there!</Typography>
          <Divider sx={{ mt: 1, mb: 4 }} />
          <Typography variant="body1">
            Ready to unleash the full potential of Howlpack? Simply connect your
            Keplr wallet by clicking the top right button and we'll do the rest!
            By doing so, we'll be able to fetch your (de)NS addresses and
            provide you with personalized notifications. Let's howl together!
          </Typography>
        </Card>
      </Fragment>
    );
  } else {
    return children || <Outlet />;
  }
}
