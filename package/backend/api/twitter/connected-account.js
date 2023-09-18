import Joi from "joi";
import {
  authClient,
  client,
  setAuthTokenFromDB,
} from "@howlpack/howlpack-shared/twitter.js";
import { validate } from "../../middleware/joi-validate.js";

const connectedAccountValidation = validate({
  query: Joi.object({
    dens: Joi.string().required(),
  }),
});

export default (router) => {
  router.get(
    "/connected-account",
    connectedAccountValidation,
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      let { dens } = ctx.query;
      const [hasAuthToken] = await setAuthTokenFromDB(dens, authClient, true);

      if (!hasAuthToken) {
        ctx.body = { data: null };
        return;
      }

      const user = await client.users.findMyUser({});

      ctx.body = { data: user.data };
    }
  );
};
