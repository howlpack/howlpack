import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function handler() {
  const rpcEndpoint = process.env.RPC_ENDPOINT;
  const client = await SigningCosmWasmClient.connect(rpcEndpoint);

  console.log(await client.getBlock());
}
