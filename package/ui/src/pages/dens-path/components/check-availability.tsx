import { Box } from "@mui/system";
import { Fragment, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress, Link, Typography } from "@mui/material";

import useTryNextClient from "../../../hooks/use-try-next-client";
import { clientState, keplrState } from "../../../state/cosmos";

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
  setFormState,
  whoami_address,
  token_id,
  path,
}: {
  setFormState?: any;
  whoami_address: string;
  token_id: string;
  path: string;
}) {
  const keplr = useRecoilValue(keplrState);
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
        const { owner } = await client.queryContractSmart(whoami_address, {
          owner_of: { token_id: token_id_withPath },
        });

        return owner;
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

  useEffect(() => {
    if (!setFormState) {
      return;
    }

    console.log(availability.data);
    setFormState((s: any) => s.set("available", !availability.data));
  }, [availability.data, setFormState]);

  return (
    <Fragment>
      <Fragment>
        {availability.data === null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckIcon sx={{ mb: 0.5 }} />{" "}
            <Typography variant="caption">AVAILABLE</Typography>
          </Box>
        )}
        {availability.data && availability.data === keplr.account && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AutoAwesomeIcon sx={{ mb: 0.5 }} />{" "}
            <Typography variant="caption" sx={{ textAlign: "center" }}>
              YOU ARE THE OWNER
              <br />
              <Link
                color={"secondary"}
                href={"https://dens.sh/tokens/" + token_id_withPath}
                target={"_blank"}
                rel="noreferrer"
              >
                MANAGE
              </Link>
            </Typography>
          </Box>
        )}
        {availability.data && availability.data !== keplr.account && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CloseIcon sx={{ mb: 0.5 }} />{" "}
            <Typography variant="caption">TAKEN</Typography>
          </Box>
        )}
      </Fragment>
    </Fragment>
  );
}
