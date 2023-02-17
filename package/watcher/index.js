import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "@howlpack/howlpack-shared/dynamo.js";

export async function handler() {
  const rpcEndpoint = process.env.RPC_ENDPOINT;
  const client = await SigningCosmWasmClient.connect(rpcEndpoint);

  const block = await client.getBlock();

  const params = {
    TableName: process.env.DYNAMO_LAST_PROCESSED_TABLE,
    Item: {
      id: block.header.chainId,
      height: block.header.height,
      at: new Date().toISOString(),
    },
  };

  const data = await ddbDocClient.send(new PutCommand(params));

  return { data };
}
