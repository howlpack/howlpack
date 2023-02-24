import { atom, atomFamily } from "recoil";
import { localStorageEffect, LOCAL_STORAGE_SELECTED_DENS } from "./effects";

export const densInitializedState = atom({
  key: "densInitializedState",
  default: false,
});

export const selectedDensState = atomFamily<string | null, string | null>({
  key: "selectedDensState",
  default: () => null,
  effects: (account) => {
    if (!account) {
      return [];
    }

    const key = `${account}`;
    return [localStorageEffect(key, LOCAL_STORAGE_SELECTED_DENS)];
  },
});
