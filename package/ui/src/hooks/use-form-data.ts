import { useCallback, useMemo, useState } from "react";
import { Map } from "immutable";

const identity = (v: any) => v;

export default function useFormData(initial: object, parsers: any = {}) {
  const [formState, setFormState] = useState<Map<any, any>>(Map(initial));

  const onChange = useCallback(
    (
      e: { target: HTMLInputElement },
      getValue = (target: HTMLInputElement) => target.value
    ) => {
      const target = e.target;
      setFormState((x) => x.setIn(target.name.split("."), getValue(target)));
    },
    [setFormState]
  );

  const parsedFormState = useMemo(() => {
    return formState.map((value, key: string) =>
      (parsers[key] || identity)(value)
    );
  }, [formState, parsers]);

  const reset = useCallback(
    (providedInitial: object) => {
      setFormState(Map(providedInitial || initial));
    },
    [setFormState, initial]
  );

  return { formState, setFormState, onChange, parsedFormState, reset };
}
