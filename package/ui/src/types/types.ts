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

export interface PostPost {
  body: string;
  cid_updated_at?: number | null;
  creator: string;
  creator_addr: string;
  hashtags?: string[] | null;
  image_uri?: null | string;
  ipfs_longform_post_cid?: null | string;
  is_reply_to?: null | string;
  mentions?: string[] | null;
  timestamp: number;
}

export interface PostInfo {
  post?: PostPost | null;
  parent?: PostPost | null;
  reply_count: number;
  uuid: string;
}
