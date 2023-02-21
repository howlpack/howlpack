import { EVENT_TYPES } from "../../shared/constants.js";
import { HOWL_POSTS_ADDR, withClient } from "../lib.js";

/**
 *
 * @param {import("../types").DecodedMsgExecuteContract} txMessage
 */
export default async function newReply(txMessage) {
  if (txMessage.contract !== HOWL_POSTS_ADDR) {
    return null;
  }

  if (!txMessage.msg?.mint?.extension?.is_reply_to) {
    return null;
  }

  const res = await withClient(async (client) => {
    return await client.queryContractSmart(HOWL_POSTS_ADDR, {
      get_post_info: {
        uuid: txMessage.msg?.mint?.token_id,
      },
    });
  }, 3);

  return {
    receiver: res.post.parent.creator,
    event: EVENT_TYPES.NEW_REPLY,
    attrs: {
      postId: txMessage.msg?.mint?.extension?.is_reply_to,
      replyId: txMessage.msg?.mint?.token_id,
      replyAuthor: res.post.post.creator,
    },
  };
}
