import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useQueries, useQuery, UseQueryOptions } from "react-query";
import { useRecoilValue } from "recoil";
import { Decimal } from "decimal.js";
import useTryNextClient from "../../../hooks/use-try-next-client";
import { clientState } from "../../../state/cosmos";
import { PathTLD } from "../../../types/types";
import { Config, PaymentDetailsResponse } from "../../../types/whoami";
import tlds from "../tlds";

export const pathTLDs: PathTLD[] = [
  {
    denom: "JUNO",
    name: "username",
    price: "1000000",
  },
  {
    denom: "JUNO",
    name: "name",
    price: "1000000",
  },
  {
    denom: "JUNO",
    name: "user",
    price: "1000000",
  },
];

function price(payment_details?: PaymentDetailsResponse) {
  if (!payment_details) {
    return null;
  }

  if (payment_details.payment_details?.native) {
    return {
      amount: new Decimal(payment_details.payment_details?.native.amount)
        .div(1e6)
        .toDP(6),
      denom: "JUNO",
    };
  }
}

export default function SelectRoot({
  formData,
  onChange,
  label,
  disabled = false,
}: {
  formData: any;
  onChange: any;
  label?: string;
  disabled?: boolean;
}) {
  const handleChange = (event: any) => {
    onChange(event, (target: any) => target.value);
  };

  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();

  const configs = useQueries(
    tlds.map<
      UseQueryOptions<
        { config: Config; payment_details: PaymentDetailsResponse } | null,
        Error
      >
    >((tld) => {
      return {
        queryKey: ["tlds", tld],
        queryFn: async () => {
          if (!client) {
            return null;
          }

          const config = await client.queryContractSmart(tld, {
            config: {},
          });

          const payment_details = await client.queryContractSmart(tld, {
            payment_details: {},
          });

          return { config, payment_details };
        },
        enabled: Boolean(client),
        onError: tryNextClient,
        staleTime: 300000,
      };
    })
  );

  const someIsFetched = configs.some((c) => c.isFetched);

  return (
    <FormControl
      sx={{ width: "100%" }}
      component="fieldset"
      variant="outlined"
      disabled={disabled}
    >
      <InputLabel id="root-domain-label">TLD</InputLabel>
      <Select
        label="TLD"
        name="TLD"
        disabled={!someIsFetched}
        value={formData.get("TLD")}
        onChange={handleChange}
        renderValue={(selected) => <Typography>{selected}</Typography>}
        MenuProps={{
          sx: {
            minWidth: "500px",
          },
          elevation: 1,
        }}
      >
        {configs
          .filter((c) => Boolean(c.data?.config.token_id))
          .map((c, ix) => {
            const p = price(c.data?.payment_details);
            return (
              <MenuItem key={ix} value={c.data?.config.token_id || ""}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Typography>{c.data?.config.token_id}</Typography>

                  <Chip
                    variant="outlined"
                    color="secondary"
                    size="small"
                    sx={{ m: 0 }}
                    label={
                      p
                        ? p.amount.toNumber().toLocaleString() + p.denom
                        : "FREE"
                    }
                  />
                </Box>
              </MenuItem>
            );
          })}
      </Select>
    </FormControl>
  );
}
