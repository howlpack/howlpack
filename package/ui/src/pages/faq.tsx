import { Divider, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";

export default function FAQ() {
  return (
    <Fragment>
      <Box py={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🐺 Why is this service provided by a third party and not the core
          team?
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body2">
          Well, we're just big fans of the Howl project, and we were so excited
          about its potential that we couldn't wait for the core team to create
          this service. So, we took matters into our own hands and built it
          ourselves!
        </Typography>
      </Box>
      <Box py={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🐺 Why do I have to connect my wallet to set my notification
          preferences on Howlpack?
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body2">
          We require users to connect their wallet to set their notification
          preferences because these preferences are stored on the chain.
          Connecting your wallet allows us to verify that you are the rightful
          owner of the (de)NS NFT, ensuring that your preferences are accurately
          stored and secure.
        </Typography>
      </Box>
      <Box py={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          🐺 Can I trust that your smart contract and dapp are safe?
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body2">
          Trust no one, not even us! We can assure you that we take the security
          of our smart contract and dapp seriously and strive to provide a
          secure service. However, instead of taking our word for it, we
          recommend doing your own research (DYOR) or asking in the Howl Discord
          chat. We believe that you should always question the security of any
          platform you use, and we encourage you to do so. In short, don't
          trust, verify!
        </Typography>
      </Box>
    </Fragment>
  );
}
