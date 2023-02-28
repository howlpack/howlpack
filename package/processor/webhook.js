import fetchThrowHttpError from "@howlpack/howlpack-shared/fetch-throw-http-error.js";
import { HOWL_URL } from "@howlpack/howlpack-shared/constants.js";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    await fetch(parsedBody.to, {
      body: JSON.stringify({
        body: parsedBody.body,
        event_type: parsedBody.event_type,
      }),
      method: "post",
    }).then(fetchThrowHttpError);
  }

  return {};
}

export function composeReplyWebhook(postAuthor, replyAuthor, postId, replyId) {
  return {
    body: {
      postAuthor,
      postAuthorUrl: new URL(postAuthor, HOWL_URL),
      replyAuthor,
      replyAuthorUrl: new URL(replyAuthor, HOWL_URL),
      postId,
      postUrl: new URL(postAuthor + "/" + postId, HOWL_URL),
      replyId,
      replyUrl: new URL(replyAuthor + "/" + replyId, HOWL_URL),
    },
  };
}

export function composeFollowerWebhook(followed, follower) {
  return {
    body: {
      followed,
      followedUrl: new URL(followed, HOWL_URL),
      follower,
      followerUrl: new URL(follower, HOWL_URL),
    },
  };
}

export function composeLikesWebhook(postAuthor, postId, amountStaked, staker) {
  return {
    body: {
      postAuthor,
      postAuthorUrl: new URL(postAuthor, HOWL_URL),
      postId,
      postUrl: new URL(postAuthor + "/" + postId, HOWL_URL),
      amountStaked,
      staker,
      stakerUrl: new URL(staker, HOWL_URL),
    },
  };
}

export function composeMentionedWebhook(mentioned, mentionedBy, postId) {
  return {
    body: {
      mentioned,
      mentionedUrl: new URL(mentioned, HOWL_URL),
      postId,
      postUrl: new URL(mentionedBy + "/" + postId, HOWL_URL),
      mentionedBy,
      mentionedByUrl: new URL(mentionedBy, HOWL_URL),
    },
  };
}
