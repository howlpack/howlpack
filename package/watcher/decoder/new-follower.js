import { HOWL_POSTS_ADDR } from "@howlpack/howlpack-shared/cosmwasm.js";
import { EVENT_TYPES } from "../../shared/constants.js";

/**
 *
 * @param {import("@howlpack/howlpack-shared/types").DecodedMsgExecuteContract} txMessage
 */
export default function newFollower(txMessage) {
  if (txMessage.contract !== HOWL_POSTS_ADDR) {
    return null;
  }

  if (!txMessage.msg?.follow) {
    return null;
  }

  return {
    receiver: txMessage.msg?.follow.following,
    event: EVENT_TYPES.NEW_FOLLOWER,
    attrs: {
      follower: txMessage.msg?.follow.following,
      hex: txMessage.hex,
    },
  };
}
