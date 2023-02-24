import { Button, Card, Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";
import { Outlet } from "react-router-dom";
import { useRecoilValue } from "recoil";
import Loading from "../components/loading";
import { keplrState } from "../state/cosmos";
import { densInitializedState, selectedDensState } from "../state/howlpack";

export default function WithDENS() {
  const keplr = useRecoilValue(keplrState);
  const densInitialized = useRecoilValue(densInitializedState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));

  if (!densInitialized) {
    return <Loading />;
  }

  if (!selectedDens) {
    return (
      <Fragment>
        <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
          <Typography variant="h5">
            No (de)NS found for the account {keplr.name}
          </Typography>
          <Divider sx={{ mt: 1, mb: 4 }} />
          <Typography variant="body1">
            Just a quick heads up - in order to fully utilize Howl and Howlpack,
            you'll need to own a (de)NS domain. This will ensure that you can
            receive notifications. So if you don't have one yet, it might be
            time to consider getting one! Thanks for being a part of Howlpack!
          </Typography>

          <Box textAlign="center" pt={2}>
            <Button
              href={"https://dens.sh/tokens/register"}
              color={"secondary"}
              variant="contained"
              disableElevation
              target="_blank"
            >
              Purchase (de)NS
            </Button>
          </Box>
        </Card>
      </Fragment>
    );
  } else {
    return <Outlet />;
  }
}
