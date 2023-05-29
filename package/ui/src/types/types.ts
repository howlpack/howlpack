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

export interface InfoExtension {
  contract_address?: null | string;
  discord_id?: null | string;
  email?: null | string;
  external_url?: null | string;
  image?: null | string;
  keybase_id?: null | string;
  /**
   * For future compatibility, we want to support a recursive lookup of tokens that
   * constitutes a path somewhat like a DNS if this is None then it is a base token
   */
  parent_token_id?: null | string;
  /**
   * A public key
   */
  pgp_public_key?: null | string;
  public_bio?: null | string;
  public_name?: null | string;
  telegram_id?: null | string;
  twitter_id?: null | string;
  validator_operator_address?: null | string;
}
