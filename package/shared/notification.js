import { EVENT_TYPES } from "./constants.js";

const positions = [
  EVENT_TYPES.NEW_FOLLOWER,
  EVENT_TYPES.NEW_REPLY,
  EVENT_TYPES.NEW_LIKE,
];

function setBit(n, i) {
  return (1n << i) | n;
}

function getBit(n, i) {
  return (n >> i) & 1n;
}

export function hasPreference(nstring = "0", p) {
  let n = BigInt(nstring);

  return Boolean(getBit(n, BigInt(positions.findIndex((pos) => pos == p))));
}

export function encodePreference(prefs) {
  let n = BigInt(0);

  prefs
    .map((p) => positions.findIndex((pos) => pos === p))
    .filter((ix) => ix >= 0)
    .map((ix) => BigInt(ix))
    .forEach((ix) => (n = setBit(n, ix)));

  return n.toString();
}