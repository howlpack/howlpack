import { Button, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";
import useFormData from "../../hooks/use-form-data";
import Path from "./components/path";
import SelectRoot from "./components/select-root";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

export default function DensPath() {
  const { formState, onChange } = useFormData({
    path: "",
    TLD: "",
  });

  return (
    <Fragment>
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Buy (de)NS path domain
      </Typography>
      <Box sx={{ mt: 8 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <SelectRoot formData={formState} onChange={onChange} />
          </Grid>
          <Grid item xs={12} md={8}>
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
    </Fragment>
  );
}
