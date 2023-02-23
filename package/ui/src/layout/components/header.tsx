import { Box, Grid, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import KeplrButton from "../../components/keplr-button";

export default function Header() {
  return (
    <Grid
      container
      alignItems={"center"}
      justifyContent={"space-between"}
      sx={{ my: 3 }}
    >
      <Grid
        item
        xs={12}
        sm={"auto"}
        sx={{ textAlign: { xs: "center" }, mb: { xs: 3, sm: 0 } }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <Typography variant="h1">
            🐺
            <Box sx={{ mx: 2, display: "inline-block" }} component={"span"}>
              Howlpack
            </Box>
            🎒
          </Typography>
          <Typography variant="caption">[unofficial extension]</Typography>
        </Link>
      </Grid>

      <Grid
        item
        xs={12}
        sm={"auto"}
        sx={{ textAlign: { xs: "center", sm: "left" } }}
      >
        <KeplrButton />
      </Grid>
    </Grid>
  );
}
