import { Box } from "@mui/system";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress, Link, Typography } from "@mui/material";

import useTryNextClient from "../../../hooks/use-try-next-client";
import { clientState, keplrState } from "../../../state/cosmos";
import useJunoHeight from "../../../hooks/use-juno-height";

export function Loading() {
  return (
    <Fragment>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: "100%",
          justifyContent: { xs: "center", md: "right" },
        }}
      >
        <CircularProgress size={15} />{" "}
        <Typography variant="caption">LOADING</Typography>
      </Box>
    </Fragment>
  );
}

const JUNO_BLOCK_TIME = 6.043;
export function calculateClaimWindow(
  initialHeight: number,
  claimWindow: number,
  currentHeight: number
) {
  const d = new Date();

  const ms =
    Math.max(0, initialHeight + claimWindow - currentHeight) *
    JUNO_BLOCK_TIME *
    1000;

  return new Date(d.getTime() + ms);
}

export function DateFormat({ date }: { date: Date }) {
  return (
    <Fragment>
      {date.toLocaleDateString()} {date.toLocaleTimeString()}
    </Fragment>
  );
}

export default function CheckAvailability({
  setFormState,
  whoami_address,
  token_id,
  path,
  tld,
}: {
  setFormState?: any;
  whoami_address: string;
  token_id: string;
  path: string;
  tld: string;
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

  const claim_window = useQuery<any>(
    ["claim_window", tld, path],
    async () => {
      if (!client) {
        return null;
      }

      try {
        const claim = await client.queryContractSmart(tld, {
          claim_info: { path: path },
        });

        return claim;
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

  const config = useQuery<any>(
    ["tlds", tld],
    async () => {
      if (!client) {
        return null;
      }

      const config = await client.queryContractSmart(tld, {
        config: {},
      });

      return config;
    },
    {
      enabled: Boolean(client) && Boolean(tld),
      staleTime: 300000,
      onError: tryNextClient,
      suspense: true,
    }
  );

  const height = useJunoHeight(
    useMemo(
      () => ({
        refetchOnWindowFocus: false,
      }),
      []
    )
  );

  const claimWindowDate = useMemo(() => {
    if (
      config.data.config.path_root_claim_blocks &&
      config.data.config.initial_height &&
      height.data
    ) {
      return calculateClaimWindow(
        config.data.config.initial_height,
        config.data.config.path_root_claim_blocks,
        height.data
      );
    }
  }, [
    config.data.config?.initial_height,
    config.data.config?.path_root_claim_blocks,
    height.data,
  ]);

  useEffect(() => {
    if (!setFormState) {
      return;
    }

    let is_in_claim_window = false;
    let path_as_base_owner = "";
    if (claim_window.data) {
      is_in_claim_window = claim_window.data.is_in_claim_window;
      path_as_base_owner = claim_window.data.path_as_base_owner;
    }

    if (is_in_claim_window && path_as_base_owner) {
      if (path_as_base_owner === keplr.account) {
        setFormState((s: any) =>
          s.set("available", !availability.data).set("path_as_base_owner", true)
        );
      } else {
        setFormState((s: any) =>
          s.set("available", false).set("path_as_base_owner", false)
        );
      }
    } else {
      setFormState((s: any) =>
        s.set("available", !availability.data).set("path_as_base_owner", false)
      );
    }
  }, [availability.data, setFormState, claim_window.data, keplr.account]);

  return (
    <Fragment>
      <Fragment>
        {[
          availability.data && availability.data === keplr.account && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: "100%",
              }}
            >
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
          ),
          availability.data && availability.data !== keplr.account && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                height: "100%",
                justifyContent: { xs: "center", md: "right" },
              }}
            >
              <CloseIcon sx={{ mb: 0.5 }} />{" "}
              <Typography variant="caption">TAKEN</Typography>
            </Box>
          ),
          claim_window.data &&
            claim_window.data.is_in_claim_window &&
            claim_window.data.path_as_base_owner === keplr.account && (
              <Typography variant="caption">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "center", md: "right" },
                  }}
                >
                  <CheckIcon /> AVAILABLE <br />
                </Box>
                as the owner of the (de)NS <strong>{path}</strong> you are
                eligible to mint for free
                {claimWindowDate && (
                  <Fragment>
                    <br />
                    until ~ <DateFormat date={claimWindowDate} />
                  </Fragment>
                )}
              </Typography>
            ),
          claim_window.data &&
            claim_window.data.is_in_claim_window &&
            claim_window.data.path_as_base_owner &&
            claim_window.data.path_as_base_owner !== keplr.account && (
              <Typography variant="caption">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    justifyContent: { xs: "center", md: "right" },
                  }}
                >
                  <CloseIcon /> RESERVED
                  <br />
                </Box>
                the path is reserved for the owner of the (de)NS{" "}
                <strong>{path}</strong>
                {claimWindowDate && (
                  <Fragment>
                    <br />
                    until ~ <DateFormat date={claimWindowDate} />
                  </Fragment>
                )}
              </Typography>
            ),
          availability.data === null && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                justifyContent: { xs: "center", md: "right" },
                height: "100%",
              }}
            >
              <CheckIcon sx={{ mb: 0.5 }} />{" "}
              <Typography variant="caption">AVAILABLE</Typography>
            </Box>
          ),
        ].find(Boolean)}
      </Fragment>
    </Fragment>
  );
}
