import Joi from "joi";
import { validate } from "../../middleware/joi-validate.js";
import { authClient } from "../../lib/twitter.js";

const redirectValidation = validate({
  query: Joi.object({
    message: Joi.string().required(),
    pubKey: Joi.string().required(),
    signature: Joi.string().required(),
  }),
});

export function generateAuthURL(state) {
  return authClient.generateAuthURL({
    code_challenge_method: "plain",
    code_challenge: process.env.TWITTER_CODE_CHALLENGE,
    state,
  });
}

export default (router) => {
  router.get(
    "/redirect",
    redirectValidation,
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      let { message, pubKey, signature } = ctx.query;

      let state = btoa(JSON.stringify({ message, pubKey, signature }));

      ctx.redirect(generateAuthURL(state));
    }
  );
};
