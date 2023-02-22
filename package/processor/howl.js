import {
  EVENT_TYPES,
  HOWL_QUEUE_TYPES,
} from "@howlpack/howlpack-shared/constants.js";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@howlpack/howlpack-shared/sqs.js";
import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import { hasPreference } from "@howlpack/howlpack-shared/notification.js";
import { decrypt } from "@howlpack/howlpack-shared/crypto.js";
import { composeFollowerEmail, composeReplyEmail } from "./email.js";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    let parsedBody = JSON.parse(body);

    if (!parsedBody.event) {
      continue;
    }

    const notifications = await withClient((client) => {
      return client.queryContractSmart(process.env.NOTIFICATIONS_CONTRACT, {
        get_notifications: {
          token_id: parsedBody.receiver,
        },
      });
    }, 3);

    if (notifications.length === 0) {
      continue;
    }

    const email = notifications.find((n) => n["email"])?.email;
    const webhook = notifications.find((n) => n["webhook"])?.webhook;

    const sqsSendCommands = [];

    if (parsedBody.event === EVENT_TYPES.NEW_FOLLOWER) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlFollowerQueueMsg)} */
      const followerMsg = parsedBody;

      if (hasPreference(email?.preferences, EVENT_TYPES.NEW_FOLLOWER)) {
        sqsSendCommands.push({
          ...composeFollowerEmail(
            followerMsg.receiver,
            followerMsg.attrs.follower
          ),
          to: decrypt(email.encoded_addr),
          type: HOWL_QUEUE_TYPES.EMAIL,
        });
      }
      if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_FOLLOWER)) {
        // TODO
        // sqsSendCommands.push({
        //   ...composeFollowerWebhook(
        //     followerMsg.receiver,
        //     followerMsg.attrs.follower
        //   ),
        //   to: decrypt(webhook.encoded_url),
        //   type: HOWL_QUEUE_TYPES.WEBHOOK,
        // });
      }
    } else if (parsedBody.event === EVENT_TYPES.NEW_REPLY) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlReplyQueueMsg)} */
      const replyMsg = parsedBody;

      if (hasPreference(email?.preferences, EVENT_TYPES.NEW_REPLY)) {
        sqsSendCommands.push({
          ...composeReplyEmail(
            replyMsg.receiver,
            replyMsg.attrs.replyAuthor,
            replyMsg.attrs.replyId
          ),
          to: decrypt(email.encoded_addr),
          type: HOWL_QUEUE_TYPES.EMAIL,
        });
      }

      if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_REPLY)) {
        // TODO
        // sqsSendCommands.push({
        //   ...composeReplyWebhook(
        //     replyMsg.receiver,
        //     replyMsg.attrs.replyAuthor,
        //     replyMsg.attrs.replyId
        //   ),
        //   to: decrypt(webhook.encoded_url),
        //   type: HOWL_QUEUE_TYPES.WEBHOOK,
        // });
      }
    }

    for (const sqsSendCommand of sqsSendCommands) {
      await sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify(sqsSendCommand),
          QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
        })
      );
    }
  }

  return {};
}
