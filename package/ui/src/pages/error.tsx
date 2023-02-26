import { Button, Card, Divider, Typography } from "@mui/material";
import { useRouteError } from "react-router-dom";

export default function Error() {
  const error: any = useRouteError();

  return (
    <div id="error-page">
      <Card variant="outlined" sx={{ mb: 2, p: 4 }}>
        <Typography variant="h5">Oops!</Typography>
        <Divider sx={{ mt: 1, mb: 4 }} />
        <Typography variant="body1">
          Sorry, an unexpected error has occurred.
        </Typography>
        <Typography variant="body1" sx={{ my: 2 }}>
          <pre>{error.statusText || error.message}</pre>
        </Typography>
        <Typography variant="body1">You can try to reload the page</Typography>
        <Button
          color="secondary"
          variant="contained"
          onClick={() => {
            window.location.reload();
          }}
          sx={{ mt: 2 }}
          disableElevation
        >
          Reload the page
        </Button>
      </Card>
    </div>
  );
}
