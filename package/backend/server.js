import app from "./app.js";
import "./lib/rollbar.js";

const port = parseInt(process.env.API_PORT || 8080);
// eslint-disable-next-line no-unused-vars
const server = app.listen(port);

console.info(`Listening to http://localhost:${port}`);
