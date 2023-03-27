export function toBaseToken(n: bigint, decimals = 6) {
  return BigInt(n) / BigInt(Math.pow(10, decimals));
}

export function addressShort(address: string | null) {
  if (!address) {
    return address;
  }

  return `${address.slice(0, 9)}...${address.slice(-4)}`;
}
