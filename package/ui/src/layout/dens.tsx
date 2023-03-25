import { Outlet } from "react-router-dom";
import { CssBaseline, Grid, ThemeProvider, useMediaQuery } from "@mui/material";
import { darkTheme, lightTheme } from "../lib/theme";
import { Helmet } from "react-helmet";
import Snackbar from "../components/snackbar";

export default function Dens() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <Snackbar />
      <CssBaseline />

      <Grid
        container
        sx={{
          flexDirection: {
            xs: "column",
            md: "row",
          },
        }}
      >
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            p: { xs: 2, sm: 6 },
            minHeight: {
              xs: "50vh",
              md: "auto",
            },
          }}
        >
          <Outlet />
        </Grid>
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            background: "url(/dens-background-min.png) no-repeat bottom",
            backgroundSize: "auto 100%",
            minHeight: "100vh",
          }}
        ></Grid>
      </Grid>
    </ThemeProvider>
  );
}
