export type DecodedMsgExecuteContract = {
  sender: string;
  contract: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any;
  funds: Coin[];
  hex: string;
};
