import {
  Avatar,
  Box,
  Button,
  Card,
  Divider,
  Link,
  Typography,
} from "@mui/material";
import { Fragment } from "react";
import { constants } from "@howlpack/howlpack-shared";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Link as ReactRouterLink } from "react-router-dom";

export default function WinstonWolfe() {
  return (
    <Fragment>
      <Box py={2}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: "bold", display: "flex", alignItems: "center" }}
        >
          BOTS <ChevronRightIcon /> Winston Wolfe
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body1">
          Winston Wolfe is a unique bot that operates on the Howl social media
          platform. It provides users with the ability to stake their tokens on
          any post made by Winston Wolfe, and in return, the bot will stake back
          the same amount. This feature is especially beneficial for users who
          want to earn additional tokens while actively participating in the
          platform.
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          The bot's name is inspired by the character Winston Wolfe from the
          classic movie "Pulp Fiction." Like the character, the bot is known for
          its efficiency and quick response time. It is also highly reliable,
          ensuring that users receive their staked tokens promptly.
        </Typography>
        <Card variant="outlined" sx={{ mt: 3, mb: 6, p: 3 }}>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="overline" sx={{ fontSize: "1em" }}>
              I'm Winston Wolfe, and I solve problems. I stake back too.
              Normally it'd take you 30 blocks to stake back, but I do it in
              under 10. And that, my friend, is what I call efficiency.
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 2,
              mb: 3,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Avatar
              alt="Winston Wolfe"
              src="https://howlpack.social/winston_wolfe.png"
              sx={{ mr: 2 }}
            />
            <Button
              variant="contained"
              disableElevation
              color="secondary"
              size="large"
              target={"_blank"}
              href={new URL(
                encodeURIComponent("howlpack::winston_wolfe"),
                constants.HOWL_URL
              ).toString()}
              sx={{ my: 2 }}
            >
              Check Winston Wolfe Profile
            </Button>
          </Box>
          <Typography variant="caption">
            * Remember to check the Winston Wolfe bio information to see how
            much HOWL is left to stake back.
          </Typography>
        </Card>

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
          }}
        >
          Interested in writing your own bot?
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Typography variant="body1">
          The howlpack webhook function is a powerful tool that allows users to
          create their own custom bots on the Howl platform. By using this
          function, users can automate various tasks, such as posting content,
          sending notifications, and responding to user interactions.{" "}
          <Link
            to="/notifications/webhooks"
            component={ReactRouterLink}
            color="secondary"
            sx={{ fontWeight: "bold" }}
          >
            Check it out
          </Link>{" "}
          and let us know what you are about to build.
        </Typography>
      </Box>
    </Fragment>
  );
}
