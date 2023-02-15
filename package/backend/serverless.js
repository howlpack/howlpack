import serverless from "serverless-http";
import app from "./app";
import "./lib/rollbar.js";

export const handler = serverless(app, {
  binary: ["image/*"],
});
