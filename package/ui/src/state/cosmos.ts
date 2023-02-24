import { atom } from "recoil";
import { localStorageEffect, LOCAL_STORAGE_KEPLR_INTERACTED } from "./effects";

export const chainState = atom({
  key: "chainState",
  default: {
    chainId: "juno-1",
  },
});

export const keplrInteractedState = atom({
  key: "keplrInteractedState",
  default: false,
  effects: [localStorageEffect(LOCAL_STORAGE_KEPLR_INTERACTED)],
});

export const keplrState = atom<{
  initialized: boolean;
  isInstalled: boolean;
  account: string | null;
  name: string | null;
}>({
  key: "keplrState",
  default: {
    initialized: false,
    isInstalled: false,
    account: null,
    name: null,
  },
});
