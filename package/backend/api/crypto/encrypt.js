import Joi from "joi";
import { encrypt } from "@howlpack/howlpack-shared/crypto.js";
import { validate } from "../../middleware/joi-validate.js";

const encryptValidation = validate({
  body: {
    content: Joi.string().required(),
  },
});

export default (router) => {
  router.post(
    "/encrypt",
    encryptValidation,
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      ctx.body = encrypt(ctx.request.body.content);
    }
  );
};
