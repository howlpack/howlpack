export const LOCAL_STORAGE_PREFIX = "howlpack:";
export const LOCAL_STORAGE_KEPLR_INTERACTED =
  LOCAL_STORAGE_PREFIX + "keplr-interacted:";
export const LOCAL_STORAGE_SELECTED_DENS =
  LOCAL_STORAGE_PREFIX + "selected-dens:";

export function localStorageEffect(_key: string, prefix = "") {
  return ({ setSelf, onSet }: { setSelf: any; onSet: any }) => {
    if (!_key) {
      return;
    }

    const key = prefix + _key;

    const savedValue = window.localStorage?.getItem(key);

    if (savedValue != null) {
      try {
        const value = JSON.parse(savedValue);
        setSelf(value);
      } catch (e) {
        window.localStorage?.removeItem(key);
      }
    }

    onSet((newValue: any, _: any, isReset: any) => {
      isReset
        ? window.localStorage?.removeItem(key)
        : window.localStorage?.setItem(key, JSON.stringify(newValue));
    });
  };
}
