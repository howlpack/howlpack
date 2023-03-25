import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";
import useFormData from "../../hooks/use-form-data";
import Path from "./components/path";

export default function DensPath() {
  const { formState, onChange } = useFormData({
    path: "",
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
      <Box sx={{ mt: 4 }}>
        <Path formData={formState} onChange={onChange} />
      </Box>
    </Fragment>
  );
}
