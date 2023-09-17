import { HOWL_QUEUE_TYPES } from "@howlpack/howlpack-shared/constants.js";
import { handler as emailHandler } from "./email.js";
import { handler as webhookHandler } from "./webhook.js";
import { handler as twitterHandler } from "./twitter.js";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    if (parsedBody.type === HOWL_QUEUE_TYPES.EMAIL) {
      await emailHandler(event);
    } else if (parsedBody.type === HOWL_QUEUE_TYPES.WEBHOOK) {
      await webhookHandler(event);
    } else if (parsedBody.type === HOWL_QUEUE_TYPES.TWITTER) {
      await twitterHandler(event);
    }
  }

  return {};
}
