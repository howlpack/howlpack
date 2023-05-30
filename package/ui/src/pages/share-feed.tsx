import { Box, Divider, Grid, IconButton, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Fragment, useDeferredValue, useState } from "react";
import { MemoTextField } from "../components/memo-textfield";
import { useRecoilState, useRecoilValue } from "recoil";
import { keplrState } from "../state/cosmos";
import { selectedDensState } from "../state/howlpack";
import { snackbarState } from "../state/snackbar";

export default function ShareFeed() {
  const keplr = useRecoilValue(keplrState);
  const selectedDens = useRecoilValue(selectedDensState(keplr.account));
  const [username, setUsername] = useState(selectedDens || "");
  const dusername = useDeferredValue(username);
  const [, setSnackbar] = useRecoilState(snackbarState);
  const iframeCode = `<iframe src="${new URL(
    "/embedded/user/" + username,
    import.meta.env.VITE_FRONTEND_URL
  ).toString()}" height="550" width="100%" title="${username} Howl Feed" frameBorder="0"></iframe>`;

  return (
    <Fragment>
      <Box py={2}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
        >
          Share your Howl feed
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body1" sx={{ mb: 4 }}>
          Now, you can effortlessly showcase your latest updates, posts, and
          adventures from the Howl community directly on any website or
          platform. Whether you're a content creator, a passionate explorer, or
          simply eager to connect with a wider audience. Share your passion,
          ignite discussions, and foster deeper engagement by embedding your
          personalized Howl feed wherever you want.
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <MemoTextField
              fullWidth
              id="howl-name"
              label={"Howl name"}
              name="howl-name"
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              value={username || ""}
              variant="outlined"
              size="medium"
            />
          </Grid>
          <Grid item xs={12} md={9}>
            <Box
              sx={(theme) => ({
                background: theme.palette.action.hover,
                p: 2,
              })}
            >
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(iframeCode);
                  setSnackbar({ message: "Copied to clipboard" });
                }}
                sx={{ float: "right" }}
                color="secondary"
              >
                <ContentCopyIcon />
              </IconButton>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  margin: 0,
                }}
              >
                {iframeCode}
              </pre>
            </Box>
            <Box sx={{ my: 5 }}>
              {dusername && (
                <iframe
                  src={"/embedded/user/" + dusername}
                  height="550"
                  width="100%"
                  title={dusername + "Howl Feed"}
                  frameBorder="0"
                ></iframe>
              )}
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Fragment>
  );
}
