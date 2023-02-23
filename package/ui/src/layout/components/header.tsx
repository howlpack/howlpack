import { Box, Grid, Typography } from "@mui/material";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";

const KeplrButton = lazy(() => import("../../components/keplr-button"));

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
        <Suspense fallback={<div>Loading...</div>}>
          <KeplrButton />
        </Suspense>
      </Grid>
    </Grid>
  );
}
