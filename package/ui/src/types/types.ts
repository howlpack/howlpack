import { Decimal } from "decimal.js";

export type RewardsStakingStats = {
  staked: Decimal;
  totalSupply: Decimal;
  newTokensRate: Decimal;
  toRate: Decimal;
  byRate: Decimal;
};

export type RewardsStakingUserStats = {
  delegated_by_active: Decimal;
  delegated_to_active: Decimal;
};

export type TokenInfoResponse = {
  decimals: number;
  name: string;
  symbol: string;
  total_supply: string;
};
