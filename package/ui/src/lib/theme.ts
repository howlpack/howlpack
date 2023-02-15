import { createTheme, darkScrollbar, responsiveFontSizes } from "@mui/material";

const dummyTheme = createTheme({});

const createColor = (mainColor: string) =>
  dummyTheme.palette.augmentColor({ color: { main: mainColor } });

const abstractTheme = {
  typography: {
    fontFamily: ["sans-serif"].join(","),
    h1: {
      fontSize: "2rem",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 2000,
    },
  },
  components: {
    MuiButton: {},
  },
  palette: {
    bluegreen: createColor("#73C4D3"),
    red: createColor("#f34b1c"),
    darkgrey: createColor("#182123"),
    lightgrey: createColor("#eeeeee"),
  },
};

export const darkTheme = responsiveFontSizes(
  createTheme(
    {
      palette: {
        mode: "dark",
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: darkScrollbar(),
          },
        },
      },
    },
    abstractTheme
  ),
  { factor: 10 }
);
export const lightTheme = responsiveFontSizes(
  createTheme(
    {
      palette: {
        mode: "light",
        primary: abstractTheme.palette.bluegreen,
        secondary: abstractTheme.palette.red,
      },
      typography: {
        allVariants: {
          color: abstractTheme.palette.darkgrey.main,
        },
      },
    },
    abstractTheme
  ),
  { factor: 10 }
);

export default darkTheme;
