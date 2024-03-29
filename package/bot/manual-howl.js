import { withSigningClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import { toBase64, toUtf8, toHex } from "@cosmjs/encoding";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import { v4 as uuid } from "uuid";

const msg =
  "Verifiable Randomness for your contract from Secret network as a service over IBC. https://scrt.network/blog/secret-vrf";

const img =
  "image:https://www.dropbox.com/s/fzkjmsqeiou0mqd/7o7xye.jpg?raw=true";

const hashtags = ["Secret"];

if (msg.length > 140) {
  throw new Error("TOO LONG " + msg.length);
}

export async function handler() {
  const r = await withSigningClient(
    async (client, signer) => {
      const [sender] = await signer.getAccounts();

      const howlBody = toBase64(
        toUtf8(
          JSON.stringify({
            mint: {
              owner: sender.address,
              token_id: uuid(),
              extension: {
                body: msg,
                creator: "howlpack::gateway2023",
                mentions: [],
                hashtags: ["Gateway2023", "Prague"].concat(hashtags),
                image_uri: img,
              },
            },
          })
        )
      );

      const sendHowlMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: sender.address,
          contract: process.env.HOWL_POSTS_ADDR,
          msg: howlBody,
          funds: [],
        }),
      };

      const msgs = [sendHowlMsg];

      const { accountNumber, sequence } = await client.getSequence(
        sender.address
      );

      const txRaw = await client.sign(
        sender.address,
        msgs,
        {
          amount: [
            {
              amount: "1750",
              denom: "ujuno",
            },
          ],
          gas: "700000",
        },
        "",
        {
          accountNumber: accountNumber,
          sequence: sequence,
          chainId: "juno-1",
        }
      );

      const tmClient = client.getTmClient();

      return await tmClient.broadcastTxSync({
        tx: TxRaw.encode(txRaw).finish(),
      });
    },
    process.env.HOWL_MNEMONIC,
    1
  );

  if (r?.code !== 0) {
    console.error(r);
  }

  console.log(toHex(r.hash).toUpperCase());
}
