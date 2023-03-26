import { Outlet } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Grid,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { darkTheme, lightTheme } from "../lib/theme";
import { Helmet } from "react-helmet";
import Snackbar from "../components/snackbar";
import useScrollPosition from "../hooks/use-scroll-position";

function BackgroundImage() {
  const scrollPosition = useScrollPosition();

  return (
    <Box
      sx={{
        background: "url(/dens-background-min.png) no-repeat bottom",
        backgroundSize: "auto 100%",
        height: "100vh",
        width: "100%",
        boxShadow: {
          md: `inset 0 0 ${Math.min(1000, scrollPosition * 2)}px ${Math.min(
            1000,
            scrollPosition
          )}px  rgba(255,255,255,${Math.min(1, scrollPosition / 300)})`,
        },
      }}
    />
  );
}

export default function Dens() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
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
            px: { xs: 2, sm: 6 },
            py: { xs: 5, sm: 6 },
            minHeight: {
              xs: "50vh",
              md: "auto",
            },
          }}
        >
          <Outlet />
        </Grid>
        <Grid item xs={12} md={6}>
          <BackgroundImage />
        </Grid>
      </Grid>
      <Box sx={{ height: "1000px" }}></Box>
    </ThemeProvider>
  );
}
