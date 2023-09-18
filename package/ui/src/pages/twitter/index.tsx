import { Card, Divider, Link as MuiLink, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useEffect } from "react";
import { selectedDensState } from "../../state/howlpack";
import { useRecoilState, useRecoilValue } from "recoil";
import { keplrState } from "../../state/cosmos";
import { snackbarState } from "../../state/snackbar";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import ConnectedAccountBox, {
  useConnectedTwitterAccount,
} from "./components/connected-account";
import Loading from "../../components/loading";

export default function TwitterIndex() {
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const [, setSnackbar] = useRecoilState(snackbarState);

  const {
    data: twitter_account,
    isSuccess,
    isLoading,
  } = useConnectedTwitterAccount(selectedDens);

  const navigate = useNavigate();

  useEffect(() => {
    if (isSuccess && !twitter_account) {
      navigate("/twitter/connect");
    }
  }, [isSuccess, twitter_account, navigate]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");

    if (!status) {
      return;
    }

    if (status === "ok") {
      setSnackbar({
        message: "Howl account successfully connected with Twitter",
      });
    } else if (status === "error") {
      setSnackbar({
        message: "Error: " + searchParams.get("message"),
      });
    }
  }, [searchParams, setSnackbar]);

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

        <Divider sx={{ mt: 1, mb: 2 }} />

        {isLoading && (
          <Fragment>
            <Loading />
          </Fragment>
        )}

        {isSuccess && twitter_account && (
          <Fragment>
            <ConnectedAccountBox
              dens={selectedDens!}
              twitter={twitter_account.username}
            />

            <Box py={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Do you want to revoke the access?
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
              <Typography variant="body2">
                Follow the link to Twitter{" "}
                <MuiLink
                  color={"secondary"}
                  href="https://twitter.com/settings/connected_apps"
                  target={"_blank"}
                  rel="noreferrer"
                >
                  https://twitter.com/settings/connected_apps
                </MuiLink>{" "}
                and revoke the beta.howl.social App permissions.
              </Typography>
            </Box>
            <Box py={2}>
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                Do you want to re-connect your twitter account?
              </Typography>
              <Divider sx={{ mt: 1, mb: 2 }} />
              <Typography variant="body2">
                <MuiLink
                  color={"secondary"}
                  component={Link}
                  to="/twitter/connect"
                >
                  Continue to connect
                </MuiLink>{" "}
                and approved the beta.howl.social App permissions.
              </Typography>
            </Box>
          </Fragment>
        )}
      </Card>
    </Fragment>
  );
}
