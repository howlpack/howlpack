import Rollbar from "rollbar";

const rollbarConfig = {
  accessToken: import.meta.env.VITE_CLIENT_ROLLBAR_ACCESS_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
  captureIp: "anonymize" as const,
  payload: {
    environment:
      import.meta.env.VITE_ROLLBAR_ENV || import.meta.env.VITE_NODE_ENV,
  },
  enabled: import.meta.env.VITE_ROLLBAR_DISABLED !== "true",
};

export default new Rollbar(rollbarConfig);
