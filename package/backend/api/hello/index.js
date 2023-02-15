import Router from "@koa/router";

const router = new Router();

router.get("/", (ctx) => {
  ctx.body = "Hello World";
});

router.del("/session", (ctx) => {
  ctx.status = 200;
  ctx.session = null;
});

export default router;
