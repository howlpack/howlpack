import { HOWL_POSTS_ADDR } from "@howlpack/howlpack-shared/cosmwasm.js";
import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export default async function newMention(txMessage) {
  if (txMessage.contract !== HOWL_POSTS_ADDR) {
    return null;
  }

  if (!txMessage.msg?.mint?.extension?.mentions) {
    return null;
  }

  return txMessage.msg.mint.extension.mentions.map((mentioned) => {
    return {
      receiver: mentioned,
      event: EVENT_TYPES.NEW_MENTION,
      attrs: {
        postId: txMessage.msg.mint.token_id,
        author: txMessage.msg.mint.extension.creator,
      },
    };
  });
}
