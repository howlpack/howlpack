import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { atom, selector } from "recoil";
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

export const JUNO_RPCS = JSON.parse(import.meta.env.VITE_JUNO_RPCS) as string[];

export const signClientState = selector<SigningCosmWasmClient | null>({
  key: "signClientState",
  dangerouslyAllowMutability: true,
  get: async ({ get }) => {
    const { SigningCosmWasmClient } = await import("@cosmjs/cosmwasm-stargate");
    const keplr = get(keplrState);

    if (!keplr.account) {
      return null;
    }

    if (!window.getOfflineSignerOnlyAmino) {
      return null;
    }

    const clientIx = get(clientIxState);
    const chain = get(chainState);
    const offlineSigner = window.getOfflineSignerOnlyAmino(chain.chainId);
    for (let i = 0; i < JUNO_RPCS.length; i++) {
      try {
        const client = await SigningCosmWasmClient.connectWithSigner(
          JUNO_RPCS[(clientIx + i) % JUNO_RPCS.length],
          offlineSigner
        );

        return client;
      } catch (e) {
        // connect error, try next client
      }
    }

    return null;
  },
});

export const clientState = selector<CosmWasmClient | null>({
  key: "clientState",
  dangerouslyAllowMutability: true,
  get: async ({ get }) => {
    const { CosmWasmClient } = await import("@cosmjs/cosmwasm-stargate");

    const clientIx = get(clientIxState);
    for (let i = 0; i < JUNO_RPCS.length; i++) {
      try {
        const client = await CosmWasmClient.connect(
          JUNO_RPCS[(clientIx + i) % JUNO_RPCS.length]
        );

        return client;
      } catch (e) {
        // connect error, try next client
      }
    }

    return null;
  },
});

export const clientIxState = atom<number>({
  key: "clientIxState",
  default: 0,
});
