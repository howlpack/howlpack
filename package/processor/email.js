import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { HOWL_URL } from "@howlpack/howlpack-shared/constants.js";

const client = new SESClient({
  region: "eu-west-1",
});

const source = "notification@howlpack.social";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [parsedBody.to],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: parsedBody.body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: parsedBody.subject,
        },
      },
      Source: source,
    });

    await client.send(command);
  }

  return {};
}

export function composeReplyEmail(receiver, replyAuthor, replyId) {
  return {
    subject: `${replyAuthor} just replied to your Howl post!`,
    body: `Hi ${receiver},

Exciting news - you've got a new reply to your Howl post!  
Follow this link to check the reply: ${new URL(
      replyAuthor + "/" + replyId,
      HOWL_URL
    )}

Keep connecting with our community and sharing awesome content!

Need help or have questions? Just reach out to us. Thanks for being a part of Howlpack!

Best,
The Howlpack Team

`,
  };
}

export function composeFollowerEmail(receiver, follower) {
  return {
    subject: `Congrats! You have a new follower!`,
    body: `Hi ${receiver},
    
We're excited to let you know that you have a new follower on Howl! ${follower} is interested in the awesome content you create and can't wait to see more from you. Keep up the great work and continue to inspire our community.
Follow this link to check howls of ${follower}: ${new URL(follower, HOWL_URL)}

If you have any questions or concerns, please don't hesitate to reach out to us. Thanks for being a part of Howlpack!

Best regards,

The Howlpack Team
`,
  };
}
