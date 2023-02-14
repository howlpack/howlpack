import { Grid, Typography } from "@mui/material";

export default function Footer() {
  return (
    <Grid container justifyContent={"space-between"}>
      <Grid item>
        <Typography variant="caption">{new Date().getFullYear()}</Typography>
      </Grid>
    </Grid>
  );
}
