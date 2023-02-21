import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@howlpack/howlpack-shared/sqs.js";
import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
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

    if (parsedBody.event === EVENT_TYPES.NEW_FOLLOWER) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlFollowerQueueMsg)} */
      const followerMsg = parsedBody;

      await sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify({
            ...composeFollowerEmail(
              followerMsg.receiver,
              followerMsg.attrs.follower
            ),
            to: "receiver@email.com",
            type: "email",
          }),
          QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
        })
      );
    } else if (parsedBody.event === EVENT_TYPES.NEW_REPLY) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlReplyQueueMsg)} */
      const replyMsg = parsedBody;

      await sqsClient.send(
        new SendMessageCommand({
          MessageBody: JSON.stringify({
            ...composeReplyEmail(
              replyMsg.receiver,
              replyMsg.attrs.replyAuthor,
              replyMsg.attrs.replyId
            ),
            to: "receiver@email.com",
            type: "email",
          }),
          QueueUrl: process.env.NOTIFICATION_QUEUE_URL,
        })
      );
    }
  }

  return {};
}
