import rollbar from "../lib/rollbar.js";

export default () => async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message,
      data: err.data,
    };
    console.error(err);
    rollbar.error(err, {
      status: ctx.status,
      payload: ctx.body,
    });
  }
};
