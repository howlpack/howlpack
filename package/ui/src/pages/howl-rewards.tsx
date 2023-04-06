import { Alert, Card, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment, useEffect, useMemo } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { Decimal } from "decimal.js";
import { useNavigate, useParams } from "react-router-dom";

import { keplrState, clientState } from "../state/cosmos";
import useTryNextClient from "../hooks/use-try-next-client";
import { useHowlPrice } from "../hooks/use-howl-price";
import { RewardsStakingStats, RewardsStakingUserStats } from "../types/types";
import { addressShort } from "../lib/token";
import { snackbarState } from "../state/snackbar";

export function HowlRewardsKeplr() {
  const keplr = useRecoilValue(keplrState);

  return <HowlRewards address={keplr.account} />;
}

export function HowlRewardsTokenId() {
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();
  const navigate = useNavigate();
  const [, setSnackbar] = useRecoilState(snackbarState);
  const params = useParams();
  const dens = params.dens;

  const { data: dens_addr } = useQuery<string | null>(
    ["dens_addr"],
    async () => {
      if (!client) {
        return null;
      }

      const config = await client.queryContractSmart(
        import.meta.env.VITE_NOTIFICATIONS_CONTRACT,
        {
          get_config: {},
        }
      );

      return config.dens_addr;
    },
    {
      enabled: Boolean(client),
      onError: tryNextClient,
      staleTime: 300000,
    }
  );

  const { data: owner, isSuccess } = useQuery<string | null>(
    ["paths", dens_addr],
    async () => {
      if (!client) {
        return null;
      }

      if (!dens_addr) {
        return null;
      }

      const { owner } = await client
        .queryContractSmart(dens_addr, {
          owner_of: { token_id: dens },
        })
        .catch(() => {
          return { owner: null };
        });

      return owner;
    },
    {
      enabled: Boolean(dens) && Boolean(dens_addr),
      onError: tryNextClient,
      staleTime: 300000,
    }
  );

  useEffect(() => {
    if (isSuccess && !owner) {
      setSnackbar({ message: `(de)NS address ${dens} not found` });
      navigate("../");
    }
  }, [owner, navigate, isSuccess, setSnackbar, dens]);

  return <HowlRewards address={owner || null} />;
}

export default function HowlRewards({ address }: { address: string | null }) {
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();
  const howlPrice = useHowlPrice();

  const total_rewards = useQuery<unknown, unknown, RewardsStakingStats>(
    ["total_rewards"],
    async () => {
      if (!client) {
        return null;
      }

      const { amount: amount_string } = await client.queryContractSmart(
        import.meta.env.VITE_HOWL_STAKING,
        {
          total_staked_at_height: {},
        }
      );

      const staked = new Decimal(amount_string);

      const { rate, split } = await client.queryContractSmart(
        import.meta.env.VITE_HOWL_STAKING,
        {
          rewards_config: {},
        }
      );

      const { total_supply } = await client.queryContractSmart(
        import.meta.env.VITE_HOWL_TOKEN,
        {
          token_info: {},
        }
      );

      return {
        staked,
        totalSupply: new Decimal(total_supply),
        newTokensRate: new Decimal(rate),
        toRate: new Decimal(split.owner),
        byRate: new Decimal(split.delegator),
      };
    },
    {
      enabled: Boolean(client),
      // 12 hours
      staleTime: 43200000,
      onError: tryNextClient,
      suspense: true,
    }
  );

  const user_rewards = useQuery<unknown, unknown, RewardsStakingUserStats>(
    ["user_rewards", address],
    async () => {
      if (!client) {
        return null;
      }

      const {
        delegated_by_active: delegated_by_active_string,
        delegated_to_active: delegated_to_active_string,
      } = await client.queryContractSmart(import.meta.env.VITE_HOWL_STAKING, {
        user_stats: { address: address },
      });

      const delegated_by_active = new Decimal(delegated_by_active_string);
      const delegated_to_active = new Decimal(delegated_to_active_string);

      return { delegated_by_active, delegated_to_active };
    },
    {
      enabled: Boolean(client) && Boolean(address),
      // 1 minute
      staleTime: 60000,
      onError: tryNextClient,
      suspense: true,
    }
  );

  const dailyStats = useMemo(() => {
    if (total_rewards.data && user_rewards.data) {
      const {
        staked: total_staked,
        toRate,
        byRate,
        newTokensRate,
      } = total_rewards.data;
      const { delegated_by_active, delegated_to_active } = user_rewards.data;

      const users_staked = toRate
        .mul(delegated_to_active)
        .plus(byRate.mul(delegated_by_active))
        .div(new Decimal(100));

      const dailyReward = users_staked.mul(newTokensRate).div(total_staked);

      return { dailyReward, users_staked };
    } else {
      return null;
    }
  }, [total_rewards.data, user_rewards.data]);

  const params = useParams();

  return (
    <Fragment>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          {params.dens && (
            <Alert severity="info" sx={{ mb: 2 }}>
              You are previewing Howl rewards for (de)NS <b>{params.dens}</b>{" "}
              whose owner is the address {address}
            </Alert>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card
            variant="outlined"
            sx={{
              p: 2,
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Your Current Daily Reward{" "}
              {address && `for ${addressShort(address)}`}
            </Typography>
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "40px" }}>
                {dailyStats ? (
                  <Fragment>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h2" sx={{ display: "inline" }}>
                        {dailyStats.dailyReward.div(1e6).toDP(2).toFixed()}
                      </Typography>
                      <Typography variant="subtitle1">HOWL</Typography>
                    </Box>
                    <Divider orientation="vertical" />
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="h5" sx={{ display: "inline" }}>
                        {dailyStats.dailyReward
                          .mul(howlPrice.data || "0")
                          .div(1e12)
                          .toDP(2)
                          .toNumber()
                          .toLocaleString()}
                      </Typography>
                      <Typography variant="subtitle1">USD</Typography>
                    </Box>
                  </Fragment>
                ) : (
                  <Fragment>
                    Simply connect your Keplr wallet by clicking the top right
                    button to see your stats
                  </Fragment>
                )}
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card variant="outlined" sx={{ p: 2, height: "100%" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              HOWL statistics
            </Typography>
            <Divider sx={{ mt: 1, mb: 2 }} />
            <Grid container spacing={2} sx={{ textAlign: "center" }}>
              <Grid item xs={6}>
                <Typography variant="h6">
                  $
                  {new Decimal(howlPrice.data || "0")
                    .div(1e6)
                    .toDP(3)
                    .toNumber()
                    .toLocaleString()}
                </Typography>
                <Typography variant="caption">HOWL price</Typography>
              </Grid>

              <Grid item xs={6}>
                {total_rewards.data && (
                  <Fragment>
                    <Typography variant="h6">
                      {total_rewards.data.newTokensRate
                        .div(1e6)
                        .toDP(0)
                        .toNumber()
                        .toLocaleString()}
                    </Typography>
                    <Typography variant="caption">
                      New tokens minted per day (inflation)
                    </Typography>
                  </Fragment>
                )}
              </Grid>
              <Grid item xs={6}>
                {total_rewards.data && (
                  <Fragment>
                    <Typography variant="h6">
                      {total_rewards.data.totalSupply
                        .div(1e6)
                        .toDP(0)
                        .toNumber()
                        .toLocaleString()}
                    </Typography>
                    <Typography variant="caption">Total supply</Typography>
                  </Fragment>
                )}
              </Grid>
              <Grid item xs={6}>
                {total_rewards.data && (
                  <Fragment>
                    <Typography variant="h6">
                      {total_rewards.data.staked
                        .div(1e6)
                        .toDP(0)
                        .toNumber()
                        .toLocaleString()}
                    </Typography>
                    <Typography variant="caption">
                      Staked via Howl posts
                    </Typography>
                  </Fragment>
                )}
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Box py={2} mt={3}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          How is the current daily reward calculated?
        </Typography>
        <Divider sx={{ mt: 1, mb: 2 }} />
        <Box
          sx={(theme) => ({
            background: theme.palette.action.hover,
            p: 2,
            mb: 3,
          })}
        >
          <pre style={{ overflowX: "auto" }}>
            {`your_staked_portion = 0.6 * total_staked_by_you + 0.2 * total_staked_to_your_posts
daily_reward        = daily_inflation * your_staked_portion / total_staked
`}
            {user_rewards.data && total_rewards.data && dailyStats && (
              <Fragment>
                <Divider sx={{ my: 3 }} />
                {`your_staked_portion = 0.6 * ${user_rewards.data.delegated_by_active
                  .div(1e6)
                  .round()
                  .toNumber()
                  .toLocaleString()} + 0.2 * ${user_rewards.data.delegated_to_active
                  .div(1e6)
                  .round()
                  .toNumber()
                  .toLocaleString()}
daily_reward        = ${total_rewards.data.newTokensRate
                  .div(1e6)
                  .round()
                  .toNumber()
                  .toLocaleString()} * ${dailyStats.users_staked
                  .div(1e6)
                  .round()
                  .toNumber()
                  .toLocaleString()} / ${total_rewards.data.staked
                  .div(1e6)
                  .round()
                  .toNumber()
                  .toLocaleString()}
`}
              </Fragment>
            )}
          </pre>
        </Box>
        <Typography variant="body2">
          If you encounter any bugs or inconsistencies in the formula, please
          let us know on Howl or Twitter.
        </Typography>
      </Box>
    </Fragment>
  );
}
