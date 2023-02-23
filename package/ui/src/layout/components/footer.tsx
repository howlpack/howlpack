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
          <Link href={howlpage} color={"secondary"} target="_blank">
            {howlpage}
          </Link>
        </Typography>
      </Grid>
    </Grid>
  );
}
