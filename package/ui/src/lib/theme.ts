import { createTheme, darkScrollbar, responsiveFontSizes } from "@mui/material";

const abstractTheme = {
  typography: {
    fontFamily: ["sans-serif"].join(","),
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
      palette: { mode: "light" },
    },
    abstractTheme
  ),
  { factor: 10 }
);

export default darkTheme;
