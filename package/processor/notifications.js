import { HOWL_QUEUE_TYPES } from "@howlpack/howlpack-shared/constants";
import { handler as emailHandler } from "./email.js";
import { handler as webhookHandler } from "./webhook.js";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    if (parsedBody.type === HOWL_QUEUE_TYPES.EMAIL) {
      return await emailHandler(event);
    } else if (parsedBody.type === HOWL_QUEUE_TYPES.WEBHOOK) {
      return await webhookHandler(event);
    }
  }

  return {};
}
