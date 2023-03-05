import Router from "@koa/router";

const router = new Router();

import winstonWolfe from "./winston-wolfe.js";

winstonWolfe(router);

export default router;
