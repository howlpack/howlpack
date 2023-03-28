import { Outlet } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Divider,
  Grid,
  ThemeProvider,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { darkTheme, lightTheme } from "../lib/theme";
import { Helmet } from "react-helmet";
import Snackbar from "../components/snackbar";
import useScrollPosition from "../hooks/use-scroll-position";
import { Container } from "@mui/system";

function BackgroundImage() {
  const scrollPosition = useScrollPosition();

  return (
    <Box
      sx={{
        background: "url(/dens-background.jpg) no-repeat bottom",
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
      <Container maxWidth="md" sx={{ mt: 10, minHeight: "1000px" }}>
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              mb: 3,
            }}
          >
            What is (de)NS?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            (de)NS is a decentralized nameservice built on top of the JUNO
            network. It allows users to create and manage custom subdomains,
            known as paths, under the (de)NS root domain.
          </Typography>
        </Box>
        <Divider sx={{ mt: 8, mb: 6, width: "50%", mx: "auto" }} />
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              mb: 3,
            }}
          >
            Are there any limitations to creating a path under the (de)NS root
            domain?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            No, there are no limitations to creating a path under the (de)NS
            root domain. Paths are equivalent to subdomains and have the same
            functionality as any other domain name registered on the (de)NS
            network. This means that the owner of the path has self-sovereign
            control over the domain name, without any restrictions or
            limitations from the (de)NS root domain.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              mt: 2,
            }}
          >
            Please note that while (de)NS paths offer a cost-effective way to
            own a domain on the JUNO network, they are not eligible for any
            potential airdrops or other rewards that may be offered exclusively
            to full domain name holders.
          </Typography>
        </Box>
        <Divider sx={{ mt: 8, mb: 6, width: "50%", mx: "auto" }} />
        <Box>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              mb: 3,
            }}
          >
            Why would I want to create a path under the (de)NS root domain?
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Creating a path under the (de)NS root domain can be a cheap way to
            purchase your own (de)NS, compared to purchasing a full domain name.
            Paths are equivalent to subdomains and are typically priced lower
            than full domain names, making them a cost-effective option for
            individuals or businesses who want to establish their online
            presence on the (de)NS network.
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
