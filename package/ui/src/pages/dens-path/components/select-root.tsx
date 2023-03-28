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
import { TokenInfoResponse } from "../../../types/types";
import { Config, PaymentDetailsResponse } from "../../../types/whoami";
import tlds from "../tlds";
import { IBC_ASSETS } from "../../../lib/token";

function price(
  payment_details?: PaymentDetailsResponse,
  token_info?: TokenInfoResponse
) {
  if (!payment_details) {
    return null;
  }

  let ibc_asset = null;

  if (payment_details.payment_details?.native) {
    const denom = payment_details.payment_details?.native.denom;
    if (denom === "ujuno") {
      return {
        amount: new Decimal(payment_details.payment_details?.native.amount)
          .div(1e6)
          .toDP(6),
        symbol: "JUNO",
      };
    } else if ((ibc_asset = IBC_ASSETS.find((i) => i.denom === denom))) {
      return {
        amount: new Decimal(payment_details.payment_details?.native.amount)
          .div(Decimal.pow(10, ibc_asset.decimals))
          .toDP(6),
        symbol: ibc_asset.symbol,
      };
    } else {
      return null;
    }
  }
  if (payment_details.payment_details?.cw20) {
    return {
      amount: new Decimal(payment_details.payment_details?.cw20.amount)
        .div(Decimal.pow(10, token_info?.decimals || 6))
        .toDP(6),
      symbol: token_info?.symbol,
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
        {
          config: Config;
          payment_details: PaymentDetailsResponse;
          cw20config?: TokenInfoResponse;
        } | null,
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

          let cw20config;
          if (payment_details.payment_details?.cw20) {
            cw20config = await client.queryContractSmart(
              payment_details.payment_details?.cw20.token_address,
              {
                token_info: {},
              }
            );
          }

          return { config, payment_details, cw20config };
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
            const p = price(c.data?.payment_details, c.data?.cw20config);
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
                        ? p.amount.toNumber().toLocaleString() + p.symbol
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
