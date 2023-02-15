import Joi from "joi";
import { validate } from "../../middleware/joi-validate.js";
import { decryptProductId } from "../../lib/decrypt.js";

const decryptValidation = validate({
  body: {
    encrypted: Joi.string().required(),
  },
});

export default (router) => {
  router.post(
    "/decrypt",
    decryptValidation,
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      ctx.body = decryptProductId(ctx.request.body.encrypted);
    }
  );
};
