import { Grid, Link, Typography } from "@mui/material";
import { constants } from "@howlpack/howlpack-shared";

export default function Footer() {
  const howlpage = new URL("howlpack", constants.HOWL_URL).toString();

  return (
    <Grid
      container
      justifyContent={"center"}
      sx={{ my: 5, textAlign: "center" }}
    >
      <Grid item>
        <Typography variant="caption">{new Date().getFullYear()}</Typography>
        <br />

        <Typography variant="caption">
          <Link
            color={"secondary"}
            href={howlpage}
            target={"_blank"}
            rel="noreferrer"
          >
            howl
          </Link>{" "}
          |{" "}
          <Link
            color={"secondary"}
            href="https://twitter.com/howlpack"
            target={"_blank"}
            rel="noreferrer"
          >
            twitter
          </Link>{" "}
          |{" "}
          <Link
            color={"secondary"}
            href="https://github.com/howlpack/howlpack/"
            target={"_blank"}
            rel="noreferrer"
          >
            github
          </Link>
        </Typography>
        <br />
        <Typography variant="caption">🐺🎒</Typography>
      </Grid>
    </Grid>
  );
}
