import {
  updateMetadataBody,
  withClient,
  withSigningClient,
} from "@howlpack/howlpack-shared/cosmwasm.js";
import { toBase64, toHex, toUtf8 } from "@cosmjs/encoding";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import createHttpError from "http-errors";
import Joi from "joi";
import { Decimal } from "decimal.js";
import { validate } from "../../middleware/joi-validate.js";

const codeKey = process.env.WINSTON_WOLFE_KEY;
const WINSTON_WOLFE_ALIAS = "howlpack::winston_wolfe";

const winstonWolfeValidation = validate({
  query: {
    code: Joi.string().required(),
  },
  body: {
    event_type: Joi.string().allow("new-like").required(),
    body: Joi.object({
      amountStaked: Joi.string().required(),
      staker: Joi.string().required(),
    }).unknown(true),
  },
});

export default (router) => {
  router.post(
    "/winston-wolfe/new-like",
    winstonWolfeValidation,
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      if (ctx.query.code !== codeKey) {
        throw createHttpError.Unauthorized("invalid query code", {
          data: { code: ctx.query.code },
        });
      }

      const { body } = ctx.request.body;

      const {
        posts: [last_post],
      } = await withClient((client) => {
        return client.queryContractSmart(process.env.HOWL_POSTS_ADDR, {
          list_creator_posts: {
            limit: 1,
            creator: body.staker,
          },
        });
      }, 3);

      if (!last_post) {
        ctx.body = {
          error: "no post found",
          data: {
            staker: body.staker,
          },
        };

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

      const { uuid } = last_post;
      /** @type {{amountStaked: import("decimal.js").Decimal}} */
      let { amountStaked } = body;
      amountStaked = new Decimal(amountStaked).mul(1e6);
      const toStakeBack = Decimal.min(balance, amountStaked);

      const balanceAfterStake = balance.minus(toStakeBack).div(1e6).floor();

      const stakeBody = toBase64(
        toUtf8(
          JSON.stringify({
            stake: {
              alias: WINSTON_WOLFE_ALIAS,
              post_id: uuid,
            },
          })
        )
      );

      const sendBody = toBase64(
        toUtf8(
          JSON.stringify({
            send: {
              contract: process.env.HOWL_STAKING,
              amount: toStakeBack.toFixed(),
              msg: stakeBody,
            },
          })
        )
      );

      const { is_following } = await withClient((client) => {
        return client.queryContractSmart(process.env.HOWL_POSTS_ADDR, {
          is_following: {
            follower_alias: WINSTON_WOLFE_ALIAS,
            following_alias: body.staker,
          },
        });
      }, 3);

      const r = await withSigningClient(
        async (client, signer) => {
          const [sender] = await signer.getAccounts();
          const stakeMsg = {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: MsgExecuteContract.fromPartial({
              sender: sender.address,
              contract: process.env.HOWL_TOKEN,
              msg: sendBody,
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
                  JSON.stringify(
                    updateMetadataBody(junoBalance, balanceAfterStake)
                  )
                )
              ),
              funds: [],
            }),
          };

          const msgs = [stakeMsg, updateMetadataMsg];

          if (!is_following) {
            const followMsg = {
              typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
              value: MsgExecuteContract.fromPartial({
                sender: sender.address,
                contract: process.env.HOWL_POSTS_ADDR,
                msg: toBase64(
                  toUtf8(
                    JSON.stringify({
                      follow: {
                        follower: WINSTON_WOLFE_ALIAS,
                        following: body.staker,
                      },
                    })
                  )
                ),
                funds: [],
              }),
            };

            msgs.push(followMsg);
          }

          const { accountNumber, sequence } = await client.getSequence(
            sender.address
          );

          const txRaw = await client.sign(
            sender.address,
            msgs,
            {
              amount: [
                {
                  amount: is_following ? "52500" : "67500",
                  denom: "ujuno",
                },
              ],
              gas: is_following ? "700000" : "900000",
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
        throw createHttpError.InternalServerError("tmclient error", {
          data: r,
        });
      }

      ctx.body = toHex(r.hash).toUpperCase();
    }
  );
};
