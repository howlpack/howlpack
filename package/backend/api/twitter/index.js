import Router from "@koa/router";

const router = new Router();

import callback from "./callback.js";
import redirect from "./redirect.js";

callback(router);
redirect(router);

export default router;
