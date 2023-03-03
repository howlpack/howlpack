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
      headers: {
        "Content-Type": "application/json",
      },
      method: "post",
    }).then(fetchThrowHttpError);
  }

  return {};
}

export function composeReplyWebhook(postAuthor, replyAuthor, postId, replyId) {
  return {
    body: {
      postAuthor,
      postAuthorUrl: new URL(
        encodeURIComponent(postAuthor),
        HOWL_URL
      ).toString(),
      replyAuthor,
      replyAuthorUrl: new URL(
        encodeURIComponent(replyAuthor),
        HOWL_URL
      ).toString(),
      postId,
      postUrl: new URL(
        encodeURIComponent(postAuthor) + "/" + postId,
        HOWL_URL
      ).toString(),
      replyId,
      replyUrl: new URL(
        encodeURIComponent(replyAuthor) + "/" + replyId,
        HOWL_URL
      ).toString(),
    },
  };
}

export function composeFollowerWebhook(followed, follower) {
  return {
    body: {
      followed,
      followedUrl: new URL(encodeURIComponent(followed), HOWL_URL).toString(),
      follower,
      followerUrl: new URL(encodeURIComponent(follower), HOWL_URL).toString(),
    },
  };
}

export function composeLikesWebhook(postAuthor, postId, amountStaked, staker) {
  return {
    body: {
      postAuthor,
      postAuthorUrl: new URL(
        encodeURIComponent(postAuthor),
        HOWL_URL
      ).toString(),
      postId,
      postUrl: new URL(
        encodeURIComponent(postAuthor) + "/" + postId,
        HOWL_URL
      ).toString(),
      amountStaked,
      staker,
      stakerUrl: new URL(encodeURIComponent(staker), HOWL_URL).toString(),
    },
  };
}

export function composeMentionedWebhook(mentioned, mentionedBy, postId) {
  return {
    body: {
      mentioned,
      mentionedUrl: new URL(encodeURIComponent(mentioned), HOWL_URL).toString(),
      postId,
      postUrl: new URL(
        encodeURIComponent(mentionedBy) + "/" + postId,
        HOWL_URL
      ).toString(),
      mentionedBy,
      mentionedByUrl: new URL(
        encodeURIComponent(mentionedBy),
        HOWL_URL
      ).toString(),
    },
  };
}

export function composeMyHowlWebhook(postAuthor, postId, postBody) {
  return {
    body: {
      postAuthor,
      postAuthorUrl: new URL(
        encodeURIComponent(postAuthor),
        HOWL_URL
      ).toString(),
      postId,
      postUrl: new URL(
        encodeURIComponent(postAuthor) + "/" + postId,
        HOWL_URL
      ).toString(),
      postBody,
    },
  };
}
