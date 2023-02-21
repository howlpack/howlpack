/* eslint-disable no-constant-condition */
import { createHash } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient, ddbDocClient } from "@howlpack/howlpack-shared/dynamo.js";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { fromUtf8 } from "@cosmjs/encoding";
import { decodeTxRaw } from "@cosmjs/proto-signing";
import { withClient } from "./lib.js";
import { decode } from "./decoder/index.js";

export function processTx(tx) {
  const txData = decodeTxRaw(tx);
  const txMessages = txData.body.messages
    .filter(({ typeUrl }) => typeUrl === "/cosmwasm.wasm.v1.MsgExecuteContract")
    .map(({ value }) => {
      const msgExecuteContract = MsgExecuteContract.decode(value);
      const decodedMsg = JSON.parse(fromUtf8(msgExecuteContract.msg));

      return {
        ...msgExecuteContract,
        msg: decodedMsg,
        hex: createHash("sha256").update(tx).digest("hex").toUpperCase(),
      };
    });

  return Promise.allSettled(txMessages.map((m) => decode(m)));
}

/**
 *
 * @param {import("@cosmjs/stargate").Block} block
 */
export function processBlock(block) {
  for (const tx of block.txs) {
    return processTx(tx);
  }
}

export async function handler() {
  let finished = false;

  while (!finished) {
    finished = await withClient(async (client) => {
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
            return true;
          } else {
            console.error("Error processing block", lastProcessedHeight);
            throw e;
          }
        }
      }
    });
  }

  return {};
}
