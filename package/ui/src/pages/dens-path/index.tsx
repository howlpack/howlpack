import { Button, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useFormData from "../../hooks/use-form-data";
import Path from "./components/path";
import SelectRoot from "./components/select-root";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useScrollPosition from "../../hooks/use-scroll-position";

function ScrollDown() {
  const scrollPosition = useScrollPosition();

  return (
    <Box
      sx={{
        opacity: 1 - Math.min(1, scrollPosition / 500),
      }}
    >
      <Typography
        variant="body1"
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Scroll for more information
      </Typography>
      <ExpandMoreIcon />
    </Box>
  );
}

export default function DensPath() {
  const { formState, onChange } = useFormData({
    path: "",
    TLD: "",
  });

  return (
    <Box sx={{ mt: { sm: 0, md: 5 }, height: "100%", position: "relative" }}>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Buy (de)NS path domain
      </Typography>
      <Box sx={{ mt: { xs: 5, sm: 8 } }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <SelectRoot formData={formState} onChange={onChange} />
          </Grid>
          <Grid item xs={12} md={7}>
            <Path formData={formState} onChange={onChange} />
          </Grid>
        </Grid>
      </Box>
      <Box
        sx={{
          textAlign: "right",
        }}
      >
        <Button
          variant="contained"
          disableElevation
          color="secondary"
          size="large"
          target={"_blank"}
          sx={{ my: 4 }}
          startIcon={<AddShoppingCartIcon />}
          href=""
        >
          Buy for 1 JUNO
        </Button>
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "0",
          textAlign: "center",
          width: "100%",
          display: {
            xs: "none",
            md: "block",
          },
        }}
      >
        <ScrollDown />
      </Box>
    </Box>
  );
}
