import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import { handler, processTx } from "./index.js";

// handler();

async function tryProcess(txhash) {
  await withClient(async (client) => {
    const tx = await client.getTx(txhash);

    const result = await processTx(tx.tx);

    console.log(result[0].value);
  });
}

tryProcess(NEW_REPLY_TX).catch((e) => console.error(e));
