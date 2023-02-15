import Router from "@koa/router";

const router = new Router();

import decrypt from "./decrypt.js";

decrypt(router);

export default router;
