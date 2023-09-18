import { useQuery } from "@tanstack/react-query";
import { url, fetchThrowHttpError } from "@howlpack/howlpack-shared";
import { Alert, Box } from "@mui/material";

export function useConnectedTwitterAccount(dens: string | null) {
  return useQuery(
    ["twitter_connected_account", dens],
    async () => {
      if (!dens) {
        return null;
      }

      return fetch(
        url.backendUrl(
          "/api/twitter/connected-account?dens=" + dens,
          import.meta.env.VITE_BACKEND_URL
        )
      )
        .then(fetchThrowHttpError)
        .then((res) => res.json())
        .then((res) => res.data);
    },
    {
      enabled: Boolean(dens),
      staleTime: 300000,
    }
  );
}

export default function ConnectedAccountBox({
  dens,
  twitter,
}: {
  dens: string;
  twitter: string;
}) {
  return (
    <Box pb={4}>
      <Alert severity="success" variant="outlined">
        It looks like your howl account <b>🐺{dens}</b> is connected with
        twitter account <b>🐦️{twitter}</b>
      </Alert>
    </Box>
  );
}
