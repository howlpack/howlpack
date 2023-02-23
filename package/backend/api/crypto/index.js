import Router from "@koa/router";

const router = new Router();

import encrypt from "./encrypt.js";

encrypt(router);

export default router;
