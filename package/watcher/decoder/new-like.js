import {
  HOWL_TOKEN,
  HOWL_STAKING,
  withClient,
  HOWL_POSTS_ADDR,
  toBaseToken,
} from "@howlpack/howlpack-shared/cosmwasm.js";
import { fromBase64, fromUtf8 } from "@cosmjs/encoding";
import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export default async function newLike(txMessage) {
  if (txMessage.contract !== HOWL_TOKEN) {
    return null;
  }

  if (txMessage.msg?.send?.contract !== HOWL_STAKING) {
    return null;
  }

  if (!txMessage.msg?.send?.msg) {
    return null;
  }

  const cw20msg = JSON.parse(fromUtf8(fromBase64(txMessage.msg.send.msg)));

  if (!cw20msg.stake) {
    return null;
  }

  const res = await withClient(async (client) => {
    return await client.queryContractSmart(HOWL_POSTS_ADDR, {
      get_post_info: {
        uuid: cw20msg.stake.post_id,
      },
    });
  }, 3);

  return {
    receiver: res.post.post.creator,
    event: EVENT_TYPES.NEW_LIKE,
    attrs: {
      postId: res.post.uuid,
      amount: toBaseToken(BigInt(txMessage.msg.send.amount)).toString(),
      staker: cw20msg.stake.alias,
    },
  };
}
