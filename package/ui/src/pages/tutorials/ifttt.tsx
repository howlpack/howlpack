import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import { Fragment } from "react";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useRecoilState } from "recoil";
import { snackbarState } from "../../state/snackbar";

export default function IFTTT() {
  const IFTTT_filter_code = `const payload = JSON.parse(MakerWebhooks.jsonEvent.JsonPayload);
const MY_HOWL_EVENT_TYPE = 'my-howl';
const PREFIX = "𝔥𝔬𝔴𝔩: "

if (payload.event_type === MY_HOWL_EVENT_TYPE) {
  Twitter.postNewTweet.setTweet(
    \`\${PREFIX}\${payload.body.postBody}\\n\\n\${payload.body.postUrl}\`
  );
} else {
  Twitter.postNewTweet.skip();
}`;
  const [, setSnackbar] = useRecoilState(snackbarState);

  return (
    <Fragment>
      <Box py={2}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
        >
          Howl <ChevronRightIcon /> Twitter integration using IFTTT Webhooks
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body1">
          The following tutorial will guide you through the process of
          connecting your IFTTT webhook with Twitter. With this webhook, you
          will be able to receive a notification every time a new howl is
          published, and post that howl as a tweet on your Twitter account. We
          will be using a filter code to parse the JSON payload. Therefore IFTTT
          plan PRO+ is needed.
        </Typography>
        <Card variant="outlined" sx={{ my: 3, p: 2, textAlign: "center" }}>
          <Typography variant="body1">
            If you want to support Howlpack, you can order IFTTT Pro+ plan using
            following link
          </Typography>
          <Button
            variant="contained"
            disableElevation
            color="secondary"
            size="large"
            target={"_blank"}
            href="https://ifttt.com/join?referral_code=mD-5fbVdxG7ocQ7Z1pyKdO3ZuP81n0Ui"
            sx={{ my: 2 }}
          >
            Order IFTTT Pro+ plan
          </Button>
        </Card>
      </Box>
      <Typography
        variant="body1"
        sx={{ "& li": { mt: 1 } }}
        component="section"
      >
        <ol>
          <li>
            Log in to your IFTTT account and click on "<b>Create</b>" button to
            create a new applet.
          </li>
          <li>
            Choose "<b>Webhooks</b>" as the "IF" trigger and select "
            <b>Receive a web request with JSON payload</b>".
          </li>
          <li>
            Enter an event name "howl" and click on "<b>Create trigger</b>".
          </li>
          <li>
            Choose "Twitter" as the "THEN" action and select "
            <b>Post a tweet</b>".
          </li>
          <li>Authorize IFTTT to access your Twitter account.</li>
          <li>
            Click on "<b>Create action</b>"
          </li>
          <li>
            In the overview click on the "+" button between "If Webhook" and
            "Then Twitter" and select "<b>Filter code</b>"
          </li>
          <li>
            Paste following code
            <Card variant="outlined" sx={{ my: 3, p: 2 }}>
              <IconButton
                onClick={() => {
                  navigator.clipboard.writeText(IFTTT_filter_code);
                  setSnackbar({ message: "Copied to clipboard" });
                }}
                color="secondary"
              >
                <ContentCopyIcon />
              </IconButton>
              <pre style={{ overflow: "auto" }}>{IFTTT_filter_code}</pre>
            </Card>
          </li>
          <li>
            Click "Add Filter" and then "Continue" and "<b>Finish</b>"
            <br />
            <br />
            You created IFTTT applet, now it's time to connect it with howlpack
          </li>
          <li>
            Go to{" "}
            <Link
              href="https://ifttt.com/maker_webhooks"
              color="secondary"
              target="_blank"
            >
              https://ifttt.com/maker_webhooks
            </Link>{" "}
            and click on "<b>Documentation</b>"
          </li>
          <li>
            Copy the link which has format
            <pre style={{ overflowX: "auto" }}>
              https://maker.ifttt.com/trigger/{"{event}"}
              /json/with/key/n-SknD***
            </pre>
            and replace the "{"{event}"}" with "howl", so it becomes
            <pre style={{ overflowX: "auto" }}>
              https://maker.ifttt.com/trigger/howl/json/with/key/n-SknD***
            </pre>
            <Alert severity="info">
              The "howl" replacement comes from the step 3. So if you used
              different event name, use it instead here as well.
            </Alert>
          </li>
          <li>
            Go to{" "}
            <Link
              href={new URL(
                "/notifications/webhooks/create",
                import.meta.env.VITE_FRONTEND_URL
              ).toString()}
              color="secondary"
              target="_blank"
              sx={{ overflowWrap: "anywhere" }}
            >
              {new URL(
                "/notifications/webhooks/create",
                import.meta.env.VITE_FRONTEND_URL
              ).toString()}
            </Link>{" "}
            and paste the IFTT URL. <br />
            Uncheck every event except for "<b>My published Howl</b>"
          </li>
          <li>
            Click "<b>Subscribe</b>", confirm the transaction and finally done.
          </li>
        </ol>
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="caption">
        Unfortunately, integrating Howl with Twitter using IFTTT is cumbersome.
        However, until Twitter releases its new paid API, it's currently the
        most straightforward method available to connect Howl and Twitter. We
        understand the frustration but we hope you can bear with us as we work
        on more seamless integration solutions in the future.
      </Typography>
    </Fragment>
  );
}
