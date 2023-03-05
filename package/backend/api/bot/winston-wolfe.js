import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import { toBase64, toUtf8 } from "@cosmjs/encoding";
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
        throw createHttpError.NotFound("no post found", {
          data: { staker: body.staker },
        });
      }

      const { uuid } = last_post;
      const { amountStaked } = body;

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

      ctx.body = sendBody;
    }
  );
};
