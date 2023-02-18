/* eslint-disable no-constant-condition */
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient, ddbDocClient } from "@howlpack/howlpack-shared/dynamo.js";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

/**
 *
 * @param {import("@cosmjs/stargate").Block} block
 */
async function processBlock(block) {}

export async function handler() {
  const rpcEndpoints = process.env.RPC_ENDPOINTS?.split(",") || [];
  let currentRpcIx = 0;

  while (true) {
    try {
      const client = await SigningCosmWasmClient.connect(
        rpcEndpoints[currentRpcIx]
      );

      const _data = await ddbClient.send(
        new GetItemCommand({
          TableName: process.env.DYNAMO_LAST_PROCESSED_TABLE,
          Key: marshall({
            id: await client.getChainId(),
          }),
          ProjectionExpression: "height",
        })
      );

      let lastProcessedHeight = unmarshall(_data.Item).height;

      while (true) {
        try {
          console.log("Processing block", lastProcessedHeight + 1);
          const block = await client.getBlock(++lastProcessedHeight);

          await processBlock(block);

          console.log("Processed block", lastProcessedHeight);

          await ddbDocClient.send(
            new PutCommand({
              TableName: process.env.DYNAMO_LAST_PROCESSED_TABLE,
              Item: {
                id: block.header.chainId,
                height: block.header.height,
                at: new Date().toISOString(),
              },
            })
          );
        } catch (e) {
          if (e.message.includes(":-32603")) {
            break;
          } else {
            throw e;
          }
        }
      }

      return {};
    } catch (e) {
      currentRpcIx = (currentRpcIx + 1) % rpcEndpoints.length;
      continue;
    }
  }
}
