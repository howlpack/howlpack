import { Box } from "@mui/system";
import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import CheckIcon from "@mui/icons-material/Check";
import useTryNextClient from "../../../hooks/use-try-next-client";
import { clientState } from "../../../state/cosmos";
import { CircularProgress, Typography } from "@mui/material";

export function Loading() {
  return (
    <Fragment>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <CircularProgress size={15} />{" "}
        <Typography variant="caption">LOADING</Typography>
      </Box>
    </Fragment>
  );
}

export default function CheckAvailability({
  whoami_address,
  token_id,
  path,
}: {
  whoami_address: string;
  token_id: string;
  path: string;
}) {
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();
  const [token_id_withPath, setToken_idWithPath] = useState<
    string | undefined
  >();

  const timeout = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }

    if (!token_id || !path) {
      return;
    }

    timeout.current = setTimeout(() => {
      setToken_idWithPath([token_id, path].join("::"));
    }, 250);
  }, [token_id, path]);

  const availability = useQuery<any>(
    ["check_availability", whoami_address, token_id_withPath],
    async () => {
      if (!client) {
        return null;
      }

      try {
        const { data } = await client.queryContractSmart(whoami_address, {
          owner_of: { token_id: token_id_withPath },
        });
        return data;
      } catch (e) {
        return null;
      }
    },
    {
      enabled: Boolean(client) && Boolean(token_id_withPath),
      staleTime: 10000,
      onError: tryNextClient,
      suspense: true,
    }
  );

  return (
    <Fragment>
      <Fragment>
        {availability.data === null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon sx={{ mb: 0.5 }} />{" "}
            <Typography variant="caption">AVAILABLE</Typography>
          </Box>
        )}
      </Fragment>
    </Fragment>
  );
}
