export function toBaseToken(n: bigint, decimals = 6) {
  return BigInt(n) / BigInt(Math.pow(10, decimals));
}
