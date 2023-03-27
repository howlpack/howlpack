import {
  FormControl,
  FormHelperText,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useEffect } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import useTryNextClient from "../hooks/use-try-next-client";
import { signClientState, keplrState } from "../state/cosmos";
import { densInitializedState, selectedDensState } from "../state/howlpack";
import Loading from "./loading";

export default function DENSSelect() {
  const keplr = useRecoilValue(keplrState);
  const signClient = useRecoilValue(signClientState);
  const tryNextClient = useTryNextClient();

  const [selectedDens, setSelectedDens] = useRecoilState(
    selectedDensState(keplr.account)
  );
  const [, setDensInitialized] = useRecoilState(densInitializedState);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedDens(event.target.value);
  };

  const { data: dens_addr } = useQuery<string | null>(
    ["dens_addr"],
    async () => {
      if (!signClient) {
        return null;
      }

      const config = await signClient.queryContractSmart(
        import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
        {
          get_config: {},
        }
      );

      return config.dens_addr;
    },
    {
      enabled: Boolean(signClient),
      onError: tryNextClient,
      staleTime: 300000,
    }
  );

  const {
    data: dens,
    isSuccess,
    isFetching,
    isIdle,
  } = useQuery<string[]>(
    ["base_tokens", dens_addr, keplr.account],
    async () => {
      if (!signClient) {
        return [];
      }

      if (!dens_addr) {
        return [];
      }

      const dens = await signClient.queryContractSmart(dens_addr, {
        base_tokens: { owner: keplr.account },
      });

      return dens.tokens;
    },
    {
      enabled: Boolean(signClient) && Boolean(dens_addr),
      onError: tryNextClient,
      staleTime: 300000,
      onSuccess: () => setDensInitialized(true),
    }
  );

  const { data: paths } = useQuery<string[]>(
    ["paths", dens_addr, dens],
    async () => {
      if (!signClient) {
        return [];
      }

      if (!dens_addr || !dens) {
        return [];
      }

      let paths: string[] = [];
      for (const d of dens) {
        const d_paths = await signClient.queryContractSmart(dens_addr, {
          paths_for_token: { owner: keplr.account, token_id: d },
        });

        paths = paths.concat(d_paths.tokens);
      }

      return paths;
    },
    {
      enabled: Boolean(dens?.length),
      onError: tryNextClient,
      staleTime: 300000,
    }
  );

  useEffect(() => {
    setDensInitialized(true);
  }, [dens, setDensInitialized]);

  useEffect(() => {
    if (dens?.[0] && !selectedDens) {
      setSelectedDens(dens[0]);
    }
  }, [dens, selectedDens, setSelectedDens]);

  if (!signClient) {
    return null;
  }

  if (isSuccess && dens.length == 0) {
    return (
      <Box textAlign={"right"}>
        <Link
          href={"https://dens.sh/tokens/register"}
          color={"secondary"}
          target="_blank"
        >
          Purchase (de)NS
        </Link>
        <br />
        <Typography variant="caption">
          The account {keplr.name} has no (de)NS registered
        </Typography>
      </Box>
    );
  }

  const renderSelectGroup = (d: any) => {
    const pathMenuItems = paths
      ?.filter((p) => p.startsWith(d + "::"))
      ?.map((p, ix) => (
        <MenuItem key={ix} value={p} sx={{ ml: 2 }}>
          {p}
        </MenuItem>
      ));
    return [
      <MenuItem key={d} value={d}>
        {d}
      </MenuItem>,
      pathMenuItems,
    ];
  };

  return (
    <div>
      <FormControl
        sx={{ minWidth: 120 }}
        size="small"
        disabled={isFetching || isIdle}
      >
        <Select
          labelId="dens-select-label"
          value={selectedDens || ""}
          onChange={handleChange}
        >
          {dens?.map(renderSelectGroup)}
        </Select>
        <FormHelperText>
          {isFetching || isIdle ? (
            <Loading />
          ) : (
            <Fragment>Active (de)NS</Fragment>
          )}
        </FormHelperText>
      </FormControl>
    </div>
  );
}
