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

const NEW_FOLLOW_TX =
  "87E569A1ACFC24EE72B0A35EB05C0A71C18259A2596BDC0CB18D64160694BFBE";

const NEW_REPLY_TX =
  "E0B89037DF4773500210A407DE45133533C6F2E4E36CF2552DF63B1E174107D2";

const NEW_LIKE_TX =
  "0C2E1A457B5E6C2F96438A4B26C4D8D170A8024001E55E6E6C66693650B200DC";

const NEW_MENTION_TX =
  "85DC79EC9DC82DF161427E0066B2C55746881B6F9A2FC225A28A3220D0D98350";

const MY_HOWL_TX =
  "F58BD7A74A327066E46F6CA9DD64A4C02BD16796760B13D56573CDD97376C56F";

tryProcess(MY_HOWL_TX).catch((e) => console.error(e));
