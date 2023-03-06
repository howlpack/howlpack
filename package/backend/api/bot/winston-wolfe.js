import {
  withClient,
  withSigningClient,
} from "@howlpack/howlpack-shared/cosmwasm.js";
import { toBase64, toHex, toUtf8 } from "@cosmjs/encoding";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx.js";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx.js";
import createHttpError from "http-errors";
import Joi from "joi";
import { validate } from "../../middleware/joi-validate.js";

const codeKey = process.env.WINSTON_WOLFE_KEY;

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

      const { uuid } = last_post;
      let { amountStaked } = body;
      amountStaked += "000000";

      const stakeBody = toBase64(
        toUtf8(
          JSON.stringify({
            stake: {
              alias: "howlpack::winston_wolfe",
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
              amount: amountStaked,
              msg: stakeBody,
            },
          })
        )
      );

      const r = await withSigningClient(
        async (client, signer) => {
          const [sender] = await signer.getAccounts();
          const updateMsg = {
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: MsgExecuteContract.fromPartial({
              sender: sender.address,
              contract: process.env.HOWL_TOKEN,
              msg: sendBody,
              funds: [],
            }),
          };

          const { accountNumber, sequence } = await client.getSequence(
            sender.address
          );

          const txRaw = await client.sign(
            sender.address,
            [updateMsg],
            {
              amount: [
                {
                  amount: "1000",
                  denom: "ujuno",
                },
              ],
              gas: "600000",
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

      if (r.code !== 0) {
        throw createHttpError.InternalServerError("tmclient error", {
          data: r,
        });
      }

      ctx.body = toHex(r.hash).toUpperCase();
    }
  );
};
