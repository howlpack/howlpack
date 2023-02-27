import fetchThrowHttpError from "@howlpack/howlpack-shared/fetch-throw-http-error.js";

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

export function composeReplyWebhook(postAuthor, replyAuthor, replyId) {
  return {
    body: {
      postAuthor,
      replyAuthor,
      replyId,
    },
  };
}

export function composeFollowerWebhook(followed, follower) {
  return {
    body: {
      followed,
      follower,
    },
  };
}

export function composeLikesWebhook(postAuthor, postId, amountStaked, staker) {
  return {
    body: {
      postAuthor,
      postId,
      amountStaked,
      staker,
    },
  };
}

export function composeMentionedWebhook(postAuthor, mentionedBy, postId) {
  return {
    body: {
      postAuthor,
      postId,
      mentionedBy,
    },
  };
}
