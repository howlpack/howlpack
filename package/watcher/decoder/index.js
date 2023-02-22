import newFollower from "./new-follower.js";
import newLike from "./new-like.js";
import newReply from "./new-reply.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export async function decode(txMessage) {
  let result = null;

  if ((result = await newFollower(txMessage))) {
    return result;
  }

  if ((result = await newReply(txMessage))) {
    return result;
  }

  if ((result = await newLike(txMessage))) {
    return result;
  }

  return null;
}
