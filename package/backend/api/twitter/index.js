import Router from "@koa/router";

const router = new Router();

import callback from "./callback.js";
import redirect from "./redirect.js";
import connectedAccount from "./connected-account.js";

callback(router);
redirect(router);
connectedAccount(router);

export default router;
