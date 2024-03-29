import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { stringToPath } from "@cosmjs/crypto/build/slip10.js";

export const HOWL_POSTS_ADDR = process.env.HOWL_POSTS_ADDR;
export const HOWL_TOKEN = process.env.HOWL_TOKEN;
export const HOWL_STAKING = process.env.HOWL_STAKING;

let currentCachedClient = null;
let currentRpcIx = 0;

/**
 *
 * @param {string[]} rpcEndpoints
 * @param {(arg: import("@cosmjs/cosmwasm-stargate").CosmWasmClient)=>{}} fn
 * @returns
 */
export async function withClient(
  fn,
  max_attempts = 1,
  rpcEndpoints = process.env.RPC_ENDPOINTS?.split(",") || []
) {
  for (let attempt = 0; attempt < max_attempts; attempt++) {
    try {
      const client =
        currentCachedClient ||
        (await SigningCosmWasmClient.connect(rpcEndpoints[currentRpcIx]));

      currentCachedClient = client;
      return await fn(client);
    } catch (e) {
      console.error(e);
      console.error("error client rpc", rpcEndpoints[currentRpcIx]);
      currentRpcIx = (currentRpcIx + 1) % rpcEndpoints.length;
      currentCachedClient = null;
      if (attempt + 1 < max_attempts) {
        console.error("trying next one", rpcEndpoints[currentRpcIx]);
      }
    }
  }
}

let currentCachedSigningClient = null;

/**
 *
 * @param {string[]} rpcEndpoints
 * @param {(client: import("@cosmjs/cosmwasm-stargate").SigningCosmWasmClient, signer: import("@cosmjs/proto-signing").DirectSecp256k1HdWallet)=>{}} fn
 * @returns
 */
export async function withSigningClient(
  fn,
  mnemonic,
  max_attempts = 1,
  rpcEndpoints = process.env.RPC_ENDPOINTS?.split(",") || []
) {
  for (let attempt = 0; attempt < max_attempts; attempt++) {
    try {
      const signer = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: "juno",
        hdPaths: [stringToPath(`m/44'/118'/0'/0/0`)],
      });
      const client =
        currentCachedSigningClient ||
        (await SigningCosmWasmClient.connectWithSigner(
          rpcEndpoints[currentRpcIx],
          signer
        ));

      currentCachedSigningClient = client;
      return await fn(client, signer);
    } catch (e) {
      console.error(e);
      console.error("error client rpc", rpcEndpoints[currentRpcIx]);
      currentRpcIx = (currentRpcIx + 1) % rpcEndpoints.length;
      currentCachedSigningClient = null;
      if (attempt + 1 < max_attempts) {
        console.error("trying next one", rpcEndpoints[currentRpcIx]);
      }
    }
  }
}

export function toBaseToken(n, decimals = 6) {
  return BigInt(n) / BigInt(Math.pow(10, decimals));
}

/**
 *
 * @param {import("decimal.js").Decimal} junoBalance
 * @param {import("decimal.js").Decimal} howlBalance
 * @returns
 */
export function updateMetadataBody(junoBalance, howlBalance) {
  return {
    update_metadata: {
      token_id: "howlpack::winston_wolfe",
      metadata: {
        image: "https://howlpack.social/winston_wolfe.png",
        image_data: null,
        email: null,
        external_url: "https://get.howlpack.social/bots/winston-wolfe",
        public_name: "Winston Wolfe ᴮᴼᵀ",
        public_bio: `${
          junoBalance.greaterThan(2000) && howlBalance.greaterThan(0)
            ? "✅ Systems operational"
            : "❌ Systems out of service"
        }, available balance: ${howlBalance
          .toNumber()
          .toLocaleString(
            "en-US"
          )}HOWL. I'm Winston Wolfe, and I solve problems. I stake back too. Normally it'd take you 30 blocks to stake back, but I do it in under 10. And that, my friend, is what I call efficiency.`,
        twitter_id: "howlpack",
        discord_id: null,
        telegram_id: null,
        keybase_id: null,
        validator_operator_address: null,
      },
    },
  };
}
