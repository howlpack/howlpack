import { Outlet } from "react-router-dom";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { Helmet } from "react-helmet";
import { darkTheme, lightTheme } from "../lib/theme";
import Snackbar from "../components/snackbar";

export default function Embedded() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <Helmet>
        <title>Howlpack 🎒</title>
      </Helmet>
      <Snackbar />
      <CssBaseline />
      <Outlet />
    </ThemeProvider>
  );
}
