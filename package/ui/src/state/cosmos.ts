import { atom } from "recoil";

export const chainState = atom({
  key: "chainState",
  default: {
    chainId: "juno-1",
  },
});

export const keplrState = atom({
  key: "keplrState",
  default: {
    initialized: false,
    isInstalled: false,
    account: null,
  },
});
