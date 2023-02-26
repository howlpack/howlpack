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
import { clientState, keplrState } from "../state/cosmos";
import { densInitializedState, selectedDensState } from "../state/howlpack";
import Loading from "./loading";

export default function DENSSelect() {
  const keplr = useRecoilValue(keplrState);
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();

  const [selectedDens, setSelectedDens] = useRecoilState(
    selectedDensState(keplr.account)
  );
  const [, setDensInitialized] = useRecoilState(densInitializedState);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedDens(event.target.value);
  };

  const {
    data: dens,
    isSuccess,
    isFetching,
    isIdle,
  } = useQuery<string[]>(
    ["base_tokens", keplr.account],
    async () => {
      if (!client) {
        return [];
      }

      const config = await client.queryContractSmart(
        import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
        {
          get_config: {},
        }
      );

      if (!config.dens_addr) {
        return [];
      }

      const dens = await client.queryContractSmart(config.dens_addr, {
        base_tokens: { owner: keplr.account },
      });

      return dens.tokens;
    },
    {
      enabled: Boolean(client),
      onError: tryNextClient,
      staleTime: 300000,
      onSuccess: () => setDensInitialized(true),
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

  if (!client) {
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
          {dens?.map((d, ix) => (
            <MenuItem key={ix} value={d}>
              {d}
            </MenuItem>
          ))}
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
