import { Outlet } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Grid,
  ThemeProvider,
  useMediaQuery,
} from "@mui/material";
import { darkTheme, lightTheme } from "../lib/theme";
import { Container } from "@mui/system";
import Header from "./components/header";
import Footer from "./components/footer";
import { Fragment } from "react";
import Menu from "./components/menu";

export default function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />

      <Container maxWidth="lg">
        <Header />

        <Fragment>
          <Grid container>
            <Grid item lg={2} sm={3} xs={12}>
              <Box sx={{ position: { sm: "sticky" }, top: { sm: 8 } }}>
                <Menu />
              </Box>
            </Grid>
            <Grid item lg={10} sm={9} xs={12}>
              <Box sx={{ mt: 1, ml: { sm: 5 } }}>
                <Outlet />
              </Box>
            </Grid>
          </Grid>
        </Fragment>
        <Footer />
      </Container>
    </ThemeProvider>
  );
}
