import { Grid, Tab, Tabs, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import KeplrButton from "../../components/keplr-button";

function a11yProps(index: string) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function Header() {
  const location = useLocation();
  return (
    <Grid
      container
      alignItems={"center"}
      justifyContent={"space-between"}
      sx={{ my: 3 }}
    >
      <Grid item xs={12} sm={"auto"}>
        <Typography variant="h1">Howlpack</Typography>
      </Grid>

      <Grid item xs={12} sm={"auto"}>
        <Tabs aria-label="top menu" value={location.pathname}>
          <Tab
            label="Notifications"
            {...a11yProps("home")}
            value={"/"}
            to={"/"}
            component={Link}
          />
          <Tab
            label="FAQ"
            {...a11yProps("faq")}
            value={"/faq"}
            to={"/faq"}
            component={Link}
          />
        </Tabs>
      </Grid>

      <Grid item xs={12} sm={"auto"}>
        <KeplrButton />
      </Grid>
    </Grid>
  );
}
