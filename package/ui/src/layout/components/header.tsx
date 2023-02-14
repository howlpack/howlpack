import { Grid, Typography } from "@mui/material";

export default function Header() {
  return (
    <Grid container justifyContent={"space-between"} sx={{ my: 3 }}>
      <Grid item xs={12} sm={"auto"}>
        <Typography variant="h1">Howlpack</Typography>
      </Grid>

      <Grid item xs={12} sm={"auto"}>
        Connect Keplr
      </Grid>
    </Grid>
  );
}
