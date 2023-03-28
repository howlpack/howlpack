import { Button, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import useFormData from "../../hooks/use-form-data";
import Path, { pathValidator } from "./components/path";
import SelectRoot from "./components/select-root";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import useScrollPosition from "../../hooks/use-scroll-position";
import { useRecoilValue } from "recoil";
import { keplrState } from "../../state/cosmos";
import KeplrButton from "../../components/keplr-button";
import { Fragment, Suspense, useMemo } from "react";
import Joi from "joi";
import CheckAvailability, {
  Loading as CheckAvailabilityLoading,
} from "./components/check-availability";

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

const densPathValidator = Joi.object({
  path: pathValidator.required(),
  TLD: Joi.object().unknown(true),
});

export default function DensPath() {
  const { formState, onChange } = useFormData({
    path: "",
    TLD: null,
  });

  const keplr = useRecoilValue(keplrState);

  const getEnabled = useMemo<boolean>(() => {
    return densPathValidator.validate(formState.toJSON()).error == null;
  }, [formState]);

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
          display: "flex",
          width: "100%",
          justifyContent: "right",
          gap: 3,
          py: 4,
        }}
      >
        {formState.get("TLD") && formState.get("path") && (
          <Suspense fallback={<CheckAvailabilityLoading />}>
            <CheckAvailability
              path={formState.get("path")}
              token_id={formState.get("TLD")?.token_id}
              whoami_address={formState.get("TLD")?.whoami_address}
            />
          </Suspense>
        )}

        {keplr.account ? (
          <Button
            variant="contained"
            disableElevation
            color="secondary"
            size="large"
            target={"_blank"}
            startIcon={<AddShoppingCartIcon />}
            href=""
            disabled={!getEnabled}
          >
            {formState.get("TLD") && formState.get("TLD").price_label && (
              <Fragment>Buy for {formState.get("TLD").price_label}</Fragment>
            )}
            {formState.get("TLD") && !formState.get("TLD").price_label && (
              <Fragment>Get for FREE</Fragment>
            )}
          </Button>
        ) : (
          <KeplrButton />
        )}
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
