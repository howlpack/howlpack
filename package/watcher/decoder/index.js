import newFollower from "./new-follower.js";
import newLike from "./new-like.js";
import newMention from "./new-mention.js";
import newReply from "./new-reply.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export async function decode(txMessage) {
  let result = [];
  let semiResult = null;

  if ((semiResult = await newFollower(txMessage))) {
    result = result.concat(semiResult);
  }

  if ((semiResult = await newReply(txMessage))) {
    result = result.concat(semiResult);
  }

  if ((semiResult = await newLike(txMessage))) {
    result = result.concat(semiResult);
  }

  if ((semiResult = await newMention(txMessage))) {
    result = result.concat(semiResult);
  }

  return result;
}
