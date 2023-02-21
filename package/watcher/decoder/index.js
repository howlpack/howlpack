import newFollower from "./new-follower.js";
import newReply from "./new-reply.js";

/**
 *
 * @param {import("../types").DecodedMsgExecuteContract} txMessage
 */
export async function decode(txMessage) {
  let result = null;

  if ((result = await newFollower(txMessage))) {
    return result;
  }

  if ((result = await newReply(txMessage))) {
    return result;
  }

  return null;
}
