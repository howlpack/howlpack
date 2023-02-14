import { Outlet } from "react-router-dom";
import { CssBaseline, ThemeProvider, useMediaQuery } from "@mui/material";
import { darkTheme, lightTheme } from "../lib/theme";
import { Container } from "@mui/system";

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <div>Howlpack</div>
        <Outlet />
        <div>footer</div>
      </Container>
    </ThemeProvider>
  );
}
