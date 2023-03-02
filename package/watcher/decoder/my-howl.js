import { HOWL_POSTS_ADDR } from "@howlpack/howlpack-shared/cosmwasm.js";
import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export default async function myHowl(txMessage) {
  if (txMessage.contract !== HOWL_POSTS_ADDR) {
    return null;
  }

  if (!txMessage.msg?.mint?.extension?.body) {
    return null;
  }

  return {
    receiver: txMessage.msg.mint.extension.creator,
    event: EVENT_TYPES.MY_HOWL,
    attrs: {
      postId: txMessage.msg.mint.token_id,
      postBody: txMessage.msg.mint.extension.body,
    },
  };
}
