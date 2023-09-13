import Koa from "koa";
import cors from "@koa/cors";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import session from "koa-session";
import HelloRouter from "./api/hello/index.js";
import CryptoRouter from "./api/crypto/index.js";
import BotRouter from "./api/bot/index.js";
import TwitterRouter from "./api/twitter/index.js";
import error from "./middleware/error.js";

const app = new Koa();
app.proxy = Boolean(process.env.API_PROXY);
app.keys = [process.env.KOA_SESSION_SECRET];

const publicRouter = new Router();

app.use(
  cors({
    credentials: "true",
  })
);

app.use(
  session(
    {
      maxAge: 1800000,
      secure: true,
      sameSite: "none",
    },
    app
  )
);

app.use(error());
app.use(bodyParser());

// === public routes ===
publicRouter.redirect("/", "/api/hello");
const publicRoutes = [
  ["/api/hello", HelloRouter.routes(), HelloRouter.allowedMethods()],
  ["/api/crypto", CryptoRouter.routes(), CryptoRouter.allowedMethods()],
  ["/api/bot", BotRouter.routes(), BotRouter.allowedMethods()],
  ["/api/twitter", TwitterRouter.routes(), TwitterRouter.allowedMethods()],
];

publicRoutes.map((r) => publicRouter.use(...r));

app.use(publicRouter.routes());
app.use(publicRouter.allowedMethods());

export default app;
