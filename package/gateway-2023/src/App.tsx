import {
  Box,
  Button,
  Card,
  Container,
  CssBaseline,
  ThemeProvider,
  useMediaQuery,
  Typography,
  Link,
  Grid,
} from "@mui/material";
import { darkTheme, lightTheme } from "@howlpack/howlpack-ui/src/lib/theme";

function App() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  return (
    <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Container maxWidth="lg" disableGutters sx={{ px: { md: 4 } }}>
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            md={3}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Box
              sx={{
                my: 5,
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
                justifyContent: "center",
                "& img": {
                  height: "130px",
                },
              }}
            >
              <img src="/howlpack-gateway.png" />
              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="h1">
                  <Box
                    sx={{ mx: 2, display: "inline-block" }}
                    component={"span"}
                  >
                    Howlpack
                  </Box>
                </Typography>
                <Typography variant="caption">[Gateway 2023 Prague]</Typography>
              </Box>

              <Box>
                <Box sx={{ mb: 8, textAlign: "center" }}>
                  <Typography variant="caption">
                    <Link
                      color={"secondary"}
                      href="https://beta.howl.social/howlpack"
                      target={"_blank"}
                      rel="noreferrer"
                    >
                      howl
                    </Link>{" "}
                    |{" "}
                    <Link
                      color={"secondary"}
                      href="https://twitter.com/howlpack"
                      target={"_blank"}
                      rel="noreferrer"
                    >
                      twitter
                    </Link>{" "}
                    |{" "}
                    <Link
                      color={"secondary"}
                      href="https://github.com/howlpack/howlpack/"
                      target={"_blank"}
                      rel="noreferrer"
                    >
                      github
                    </Link>
                  </Typography>
                </Box>

                <Button
                  variant="outlined"
                  disableElevation
                  color="secondary"
                  size="large"
                  fullWidth
                  href="https://beta.howl.social"
                  target={"_blank"}
                  sx={{ mb: 2, textAlign: "center" }}
                >
                  Create your own Howl stream
                </Button>
                <Card color="default" variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2">
                    Welcome to the Howl feed of my Prague Gateway 2023
                    expedition! Howl is a decentralized social network powered
                    by Juno, while{" "}
                    <Link
                      color={"secondary"}
                      href="https://gateway.events/"
                      target={"_blank"}
                      rel="noreferrer"
                    >
                      Gateway is the esteemed Cosmos-SDK chain conference
                    </Link>{" "}
                    held in Prague, graciously hosted by RockawayX. Explore this
                    page for updates, insights, and highlights from this
                    exciting event!
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            md={9}
            sx={{
              margin: { xs: 1, md: "2.5vh 0" },
              "&>iframe": (theme) => ({
                minHeight: {
                  xs: `calc(100vh - ${theme.spacing(2)})`,
                  md: "95vh",
                },
              }),
            }}
          >
            <iframe
              src="https://get.howlpack.social/embedded/user/howlpack::gateway2023?allowImage=true"
              width="100%"
              title="howlpack Howl Feed"
              frameBorder="0"
            ></iframe>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
