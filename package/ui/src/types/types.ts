import { Decimal } from "decimal.js";

export type PathTLD = {
  name: string;
  price: string;
  denom: string;
};

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
