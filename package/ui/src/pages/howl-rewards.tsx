import { Card, Divider, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Fragment } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { clientState, keplrState } from "../state/cosmos";
import useTryNextClient from "../hooks/use-try-next-client";
import { useHowlPrice } from "../hooks/use-howl-price";
import { toBaseToken } from "../lib/token";

export default function HowlRewards() {
  const keplr = useRecoilValue(keplrState);
  const client = useRecoilValue(clientState);
  const tryNextClient = useTryNextClient();
  const howlPrice = useHowlPrice();

  const total_rewards = useQuery<any, any>(
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

      const staked = BigInt(amount_string);

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
        totalSupply: BigInt(total_supply),
        newTokensRate: BigInt(rate),
        toRate: BigInt(split.owner),
        byRate: BigInt(split.delegator),
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

  const user_rewards = useQuery<any, any>(
    ["user_rewards", keplr.account],
    async () => {
      if (!client) {
        return null;
      }

      const {
        delegated_by_active: delegated_by_active_string,
        delegated_to_active: delegated_to_active_string,
      } = await client.queryContractSmart(import.meta.env.VITE_HOWL_STAKING, {
        user_stats: { address: keplr.account },
      });

      const delegated_by_active = BigInt(delegated_by_active_string);
      const delegated_to_active = BigInt(delegated_to_active_string);

      return { delegated_by_active, delegated_to_active };
    },
    {
      enabled: Boolean(client),
      // 1 minute
      staleTime: 60000,
      onError: tryNextClient,
      suspense: true,
    }
  );

  let dailyReward = BigInt(0);
  let users_staked = BigInt(0);
  if (total_rewards.data && user_rewards.data) {
    const {
      staked: total_staked,
      toRate,
      byRate,
      newTokensRate,
    } = total_rewards.data;
    const { delegated_by_active, delegated_to_active } = user_rewards.data;

    users_staked =
      (BigInt(toRate * delegated_to_active) +
        BigInt(byRate * delegated_by_active)) /
      BigInt(100);
    dailyReward = (users_staked * newTokensRate) / total_staked;

    dailyReward = toBaseToken(dailyReward);
  }

  return (
    <Fragment>
      <Grid container spacing={1}>
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
              Your Current Daily Reward for {keplr.name}
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
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h2" sx={{ display: "inline" }}>
                    {dailyReward.toString()}
                  </Typography>
                  <Typography variant="subtitle1">HOWL</Typography>
                </Box>
                <Divider orientation="vertical" />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h5" sx={{ display: "inline" }}>
                    {(
                      (Number(dailyReward) * parseInt(howlPrice.data || "0")) /
                      1e6
                    ).toPrecision(3)}
                  </Typography>
                  <Typography variant="subtitle1">USD</Typography>
                </Box>
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
                  {(parseInt(howlPrice.data || "0") / 1e6).toPrecision(3)}$
                </Typography>
                <Typography variant="caption">HOWL price</Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="h6">
                  {toBaseToken(
                    total_rewards.data.newTokensRate
                  ).toLocaleString()}
                </Typography>
                <Typography variant="caption">
                  New tokens minted per day (inflation)
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">
                  {toBaseToken(total_rewards.data.totalSupply).toLocaleString()}
                </Typography>
                <Typography variant="caption">Total supply</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">
                  {toBaseToken(total_rewards.data.staked).toLocaleString()}
                </Typography>
                <Typography variant="caption">Staked via Howl posts</Typography>
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
        <Box sx={{ background: "#efefef", p: 2, mb: 3 }}>
          <pre style={{ overflowX: "auto" }}>
            {`your_staked_portion = 0.6 * total_staked_by_you + 0.2 * total_staked_to_your_posts
daily_reward        = daily_inflation * your_staked_portion / total_staked
`}
            <Divider sx={{ my: 3 }} />
            {`your_staked_portion = 0.6 * ${toBaseToken(
              user_rewards.data.delegated_by_active
            ).toLocaleString()} + 0.2 * ${toBaseToken(
              user_rewards.data.delegated_to_active
            ).toLocaleString()}
daily_reward        = ${toBaseToken(
              total_rewards.data.newTokensRate
            ).toLocaleString()} * ${toBaseToken(
              users_staked
            ).toLocaleString()} / ${toBaseToken(
              total_rewards.data.staked
            ).toLocaleString()}
`}
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
