import Rollbar from "rollbar";

export default new Rollbar({
  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  environment: process.env.ROLLBAR_ENV || process.env.NODE_ENV,
  enabled: process.env.ROLLBAR_DISABLED !== "true",
});
