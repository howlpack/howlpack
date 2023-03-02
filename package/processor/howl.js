import {
  EVENT_TYPES,
  HOWL_QUEUE_TYPES,
} from "@howlpack/howlpack-shared/constants.js";
import { SendMessageCommand } from "@aws-sdk/client-sqs";
import { sqsClient } from "@howlpack/howlpack-shared/sqs.js";
import { withClient } from "@howlpack/howlpack-shared/cosmwasm.js";
import { hasPreference } from "@howlpack/howlpack-shared/notification.js";
import { decrypt } from "@howlpack/howlpack-shared/crypto.js";
import {
  composeFollowerEmail,
  composeLikesEmail,
  composeMentionedEmail,
  composeMyHowlEmail,
  composeReplyEmail,
} from "./email.js";
import {
  composeFollowerWebhook,
  composeLikesWebhook,
  composeMentionedWebhook,
  composeMyHowlWebhook,
  composeReplyWebhook,
} from "./webhook.js";

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
    const webhooks = notifications
      .filter((n) => n["webhook"])
      .map((n) => n.webhook);

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
      webhooks.forEach((webhook) => {
        if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_FOLLOWER)) {
          sqsSendCommands.push({
            ...composeFollowerWebhook(
              followerMsg.receiver,
              followerMsg.attrs.follower
            ),
            to: decrypt(webhook.encoded_url),
            event_type: EVENT_TYPES.NEW_FOLLOWER,
            type: HOWL_QUEUE_TYPES.WEBHOOK,
          });
        }
      });
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

      webhooks.forEach((webhook) => {
        if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_REPLY)) {
          sqsSendCommands.push({
            ...composeReplyWebhook(
              replyMsg.receiver,
              replyMsg.attrs.replyAuthor,
              replyMsg.attrs.postId,
              replyMsg.attrs.replyId
            ),
            to: decrypt(webhook.encoded_url),
            event_type: EVENT_TYPES.NEW_REPLY,
            type: HOWL_QUEUE_TYPES.WEBHOOK,
          });
        }
      });
    } else if (parsedBody.event === EVENT_TYPES.NEW_LIKE) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlLikeQueueMsg)} */
      const likeMsg = parsedBody;

      if (hasPreference(email?.preferences, EVENT_TYPES.NEW_LIKE)) {
        sqsSendCommands.push({
          ...composeLikesEmail(
            likeMsg.receiver,
            likeMsg.attrs.postId,
            likeMsg.attrs.amount,
            likeMsg.attrs.staker
          ),
          to: decrypt(email.encoded_addr),
          type: HOWL_QUEUE_TYPES.EMAIL,
        });
      }

      webhooks.forEach((webhook) => {
        if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_LIKE)) {
          sqsSendCommands.push({
            ...composeLikesWebhook(
              likeMsg.receiver,
              likeMsg.attrs.postId,
              likeMsg.attrs.amount,
              likeMsg.attrs.staker
            ),
            to: decrypt(webhook.encoded_url),
            event_type: EVENT_TYPES.NEW_LIKE,
            type: HOWL_QUEUE_TYPES.WEBHOOK,
          });
        }
      });
    } else if (parsedBody.event === EVENT_TYPES.NEW_MENTION) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlMentionedQueueMsg)} */
      const mentionedMsg = parsedBody;

      if (hasPreference(email?.preferences, EVENT_TYPES.NEW_MENTION)) {
        sqsSendCommands.push({
          ...composeMentionedEmail(
            mentionedMsg.receiver,
            mentionedMsg.attrs.author,
            mentionedMsg.attrs.postId
          ),
          to: decrypt(email.encoded_addr),
          type: HOWL_QUEUE_TYPES.EMAIL,
        });
      }

      webhooks.forEach((webhook) => {
        if (hasPreference(webhook?.preferences, EVENT_TYPES.NEW_MENTION)) {
          sqsSendCommands.push({
            ...composeMentionedWebhook(
              mentionedMsg.receiver,
              mentionedMsg.attrs.author,
              mentionedMsg.attrs.postId
            ),
            to: decrypt(webhook.encoded_url),
            event_type: EVENT_TYPES.NEW_MENTION,
            type: HOWL_QUEUE_TYPES.WEBHOOK,
          });
        }
      });
    } else if (parsedBody.event === EVENT_TYPES.MY_HOWL) {
      /** @type {(import("@howlpack/howlpack-shared/types").HowlMyHowlQueueMsg)} */
      const myHowlMsg = parsedBody;

      if (hasPreference(email?.preferences, EVENT_TYPES.MY_HOWL)) {
        sqsSendCommands.push({
          ...composeMyHowlEmail(myHowlMsg.receiver, myHowlMsg.attrs.postId),
          to: decrypt(email.encoded_addr),
          type: HOWL_QUEUE_TYPES.EMAIL,
        });
      }

      webhooks.forEach((webhook) => {
        if (hasPreference(webhook?.preferences, EVENT_TYPES.MY_HOWL)) {
          sqsSendCommands.push({
            ...composeMyHowlWebhook(
              myHowlMsg.receiver,
              myHowlMsg.attrs.postId,
              myHowlMsg.attrs.postBody
            ),
            to: decrypt(webhook.encoded_url),
            event_type: EVENT_TYPES.MY_HOWL,
            type: HOWL_QUEUE_TYPES.WEBHOOK,
          });
        }
      });
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
