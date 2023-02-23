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
