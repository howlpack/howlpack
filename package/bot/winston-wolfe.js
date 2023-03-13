import {
  updateMetadataBody,
  withSigningClient,
} from "@howlpack/howlpack-shared/cosmwasm.js";
import { toBase64, toUtf8, toHex } from "@cosmjs/encoding";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import { Decimal } from "decimal.js";

export async function handler() {
  /** @type {{delegated_to_rewards: import("decimal.js").Decimal, delegated_by_rewards:import("decimal.js").Decimal}} */
  let { delegated_to_rewards, delegated_by_rewards } = await withSigningClient(
    async (client, signer) => {
      return client.queryContractSmart(process.env.HOWL_STAKING, {
        user_stats: {
          address: (await signer.getAccounts())[0].address,
        },
      });
    },
    process.env.HOWL_MNEMONIC,
    3
  );

  delegated_by_rewards = new Decimal(delegated_by_rewards);
  delegated_to_rewards = new Decimal(delegated_to_rewards);

  const all_reward = delegated_by_rewards.add(delegated_to_rewards);

  console.log("all rewards", all_reward);
  if (!all_reward.greaterThan(0)) {
    return;
  }

  /** @type {{balance: import("decimal.js").Decimal}} */
  let { balance } = await withSigningClient(
    async (client, signer) => {
      return client.queryContractSmart(process.env.HOWL_TOKEN, {
        balance: {
          address: (await signer.getAccounts())[0].address,
        },
      });
    },
    process.env.HOWL_MNEMONIC,
    3
  );
  balance = new Decimal(balance);

  const balanceAfterClaim = balance.add(all_reward).div(1e6).floor();

  const claimAllBody = toBase64(
    toUtf8(
      JSON.stringify({
        claim_all_rewards: {},
      })
    )
  );

  const r = await withSigningClient(
    async (client, signer) => {
      const [sender] = await signer.getAccounts();
      const claimMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: sender.address,
          contract: process.env.HOWL_STAKING,
          msg: claimAllBody,
          funds: [],
        }),
      };

      /** @type {import("decimal.js").Decimal} */
      let junoBalance = await client.getBalance(sender.address, "ujuno");
      junoBalance = new Decimal(junoBalance.amount);

      const updateMetadataMsg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: sender.address,
          contract:
            "juno1mf309nyvr4k4zv0m7m40am9n7nqjf6gupa0wukamwmhgntqj0gxs9hqlrr",
          msg: toBase64(
            toUtf8(
              JSON.stringify(updateMetadataBody(junoBalance, balanceAfterClaim))
            )
          ),
          funds: [],
        }),
      };

      const msgs = [claimMsg, updateMetadataMsg];

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
