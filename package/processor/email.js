import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { HOWL_URL } from "@howlpack/howlpack-shared/constants.js";

const client = new SESClient({
  region: "eu-west-1",
});

const source = '"Howlpack Notifications" <notification@howlpack.social>';

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
      encodeURIComponent(replyAuthor) + "/" + replyId,
      HOWL_URL
    )}

Keep connecting with our community and sharing awesome content!

Need help or have questions? Just reach out to us. Thanks for being a part of Howlpack!

Best,
The Howlpack Team
${new URL("howlpack", HOWL_URL)}
`,
  };
}

export function composeFollowerEmail(receiver, follower) {
  return {
    subject: `Congrats! You have a new follower!`,
    body: `Hi ${receiver},
    
We're excited to let you know that you have a new follower on Howl! ${follower} is interested in the content you create.
Follow this link to check howls from ${follower}: ${new URL(
      encodeURIComponent(follower),
      HOWL_URL
    )}

If you have any questions or concerns, please don't hesitate to reach out to us. Thanks for being a part of Howlpack!

Best regards,

The Howlpack Team
${new URL("howlpack", HOWL_URL)}
`,
  };
}

export function composeLikesEmail(receiver, postId, amountStaked, staker) {
  return {
    subject: `Woohoo! You've received likes through staking ${amountStaked} Howl tokens!`,
    body: `Hi ${receiver},
    
We wanted to congratulate you on receiving likes for your Howl ${new URL(
      encodeURIComponent(receiver) + "/" + postId,
      HOWL_URL
    )} ! These likes were received through staking ${amountStaked} Howl tokens from ${staker} (${new URL(
      encodeURIComponent(staker),
      HOWL_URL
    )}). Keep up the great work!

If you have any questions about staking Howl tokens or anything else, please don't hesitate to reach out to us. Thanks for being a part of Howlpack!

Best regards,

The Howlpack Team
${new URL("howlpack", HOWL_URL)}
`,
  };
}

export function composeMentionedEmail(receiver, mentionedBy, postId) {
  return {
    subject: `You've been mentioned in a Howl!`,
    body: `Hi ${receiver},

We wanted to let you know that you were mentioned in a Howl! ${mentionedBy} has mentioned you in their post.

You can check out the Howl by clicking the link below:
${new URL(encodeURIComponent(mentionedBy) + "/" + postId, HOWL_URL)}
    
We hope you enjoy the mention and have a great day!
    
Best,
The Howlpack Team
${new URL("howlpack", HOWL_URL)}
`,
  };
}

export function composeMyHowlEmail(receiver, postId) {
  return {
    subject: `Your Howl has been published!`,
    body: `Hi ${receiver},

We are delighted to inform you that your latest Howl has just been published on Howl. 
${new URL(encodeURIComponent(receiver) + "/" + postId, HOWL_URL)}

Congratulations! Your thoughts and ideas have been shared with the Howl community.

Thank you for your contribution to the Howl community. 

Best,
The Howlpack Team
${new URL("howlpack", HOWL_URL)}
`,
  };
}
