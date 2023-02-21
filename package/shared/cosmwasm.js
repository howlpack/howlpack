import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export const HOWL_POSTS_ADDR = process.env.HOWL_POSTS_ADDR;

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
