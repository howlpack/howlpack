import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { fromBase64 } from "@cosmjs/encoding";
import Joi from "joi";
import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import createHttpError from "http-errors";
import { ddbDocClient } from "@howlpack/howlpack-shared/dynamo.js";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { authClient, client } from "@howlpack/howlpack-shared/twitter.js";
import { validate } from "../../middleware/joi-validate.js";
import { generateAuthURL } from "./redirect.js";

// call this method to save code_challenge into the twitter-api-sdk authClient
generateAuthURL();

const callbackValidation = validate({
  query: Joi.object({
    state: Joi.string().required(),
    code: Joi.string().required(),
  }).unknown(true),
});

export default (router) => {
  router.get(
    "/callback",
    callbackValidation,
    async (ctx, next) => {
      try {
        return await next();
      } catch (err) {
        const redirectUrl = new URL("/twitter", process.env.FRONTEND_URL);

        redirectUrl.searchParams.append("status", "error");
        redirectUrl.searchParams.append("message", err.message);

        ctx.redirect(redirectUrl.toString());
      }
    },
    /**
     * @param {import("koa").Context} ctx
     */
    async (ctx) => {
      const code = ctx.query.code;
      let { message, pubKey, signature } = JSON.parse(atob(ctx.query.state));
      let { dens_name, address } = JSON.parse(atob(message));

      const prefix = "juno";
      const uint8Signature = fromBase64(signature);
      const pubKeyUint8Array = fromBase64(pubKey);

      const isRecovered = verifyADR36Amino(
        prefix,
        address,
        message,
        pubKeyUint8Array,
        uint8Signature
      );

      if (!isRecovered) {
        throw createHttpError.BadRequest("signature not verified");
      }

      /** @type {string[] | undefined} */
      let tokens = await withClient(async (client) => {
        const config = await client.queryContractSmart(
          process.env.NOTIFICATIONS_CONTRACT,
          {
            get_config: {},
          }
        );

        const { dens_addr } = config;

        const dens = await client.queryContractSmart(dens_addr, {
          base_tokens: { owner: address, limit: 1000 },
        });

        return dens.tokens;
      }, 3);

      const address_has_the_dens = (tokens || []).includes(dens_name);

      if (!address_has_the_dens) {
        throw createHttpError.BadRequest("dens token not found for address", {
          data: {
            dens_name,
            address,
          },
        });
      }

      let token;

      try {
        const resp = await authClient.requestAccessToken(code);
        token = resp.token;
      } catch (e) {
        let err = createHttpError.BadRequest("twitter error");

        err.data = {
          originalError: e,
        };

        throw err;
      }

      const user = await client.users.findMyUser({});

      await ddbDocClient.send(
        new PutCommand({
          TableName: process.env.DYNAMO_TWITTER_TABLE,
          Item: {
            dens: dens_name,
            user: user.data,
            token: token,
            at: new Date().toISOString(),
          },
        })
      );

      const redirectUrl = new URL("/twitter", process.env.FRONTEND_URL);
      redirectUrl.searchParams.append("status", "ok");

      ctx.redirect(redirectUrl.toString());
    }
  );
};
