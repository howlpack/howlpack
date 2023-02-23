import { atom } from "recoil";
import { localStorageEffect } from "./effects";

export const chainState = atom({
  key: "chainState",
  default: {
    chainId: "juno-1",
  },
});

const LOCAL_STORAGE_PREFIX = "howlpack:";
const LOCAL_STORAGE_KEPLR_INTERACTED =
  LOCAL_STORAGE_PREFIX + "keplr-interacted:";

export const keplrInteractedState = atom({
  key: "keplrInteractedState",
  default: false,
  effects: [localStorageEffect(LOCAL_STORAGE_KEPLR_INTERACTED)],
});

export const keplrState = atom<{
  initialized: boolean;
  isInstalled: boolean;
  account: string | null;
}>({
  key: "keplrState",
  default: {
    initialized: false,
    isInstalled: false,
    account: null,
  },
});
