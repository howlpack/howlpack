import { atom } from "recoil";

export const snackbarState = atom<{ message: string }>({
  key: "snackbarState",
  default: undefined,
});
