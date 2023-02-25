import { useCallback } from "react";
import { useRecoilState } from "recoil";
import { clientIxState, JUNO_RPCS } from "../state/cosmos";

export default function useTryNextClient() {
  const [, setClientIx] = useRecoilState(clientIxState);

  return useCallback(() => {
    console.log("trying next node");
    setClientIx((ix) => (ix + 1) % JUNO_RPCS.length);
  }, [setClientIx]);
}
