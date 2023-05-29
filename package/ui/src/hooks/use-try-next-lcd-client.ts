import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { clientLcdIxState, JUNO_LCDS } from "../state/cosmos";

export default function useTryNextLCDClient() {
  const [, setClientLcdIx] = useRecoilState(clientLcdIxState);

  return useCallback(() => {
    console.log("trying next LCD");
    setClientLcdIx((ix) => (ix + 1) % JUNO_LCDS.length);
  }, [setClientLcdIx]);
}
