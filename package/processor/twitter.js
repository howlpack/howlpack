import { HOWL_URL } from "@howlpack/howlpack-shared/constants.js";
import {
  authClient,
  client,
  setAuthTokenFromDB,
} from "@howlpack/howlpack-shared/twitter.js";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    let { postAuthor, postAuthorUrl, postId, postUrl, postBody, mentions } =
      parsedBody.body;

    const [isSet] = await setAuthTokenFromDB(postAuthor, authClient);

    if (isSet) {
      await client.tweets.createTweet({
        card_uri: postUrl,
        text: postBody,
      });
    }
  }

  return {};
}

export function composeReplyTweet(postAuthor, replyAuthor, postId, replyId) {
  throw new Error("not-implemented");
}

export function composeFollowerTweet(followed, follower) {
  throw new Error("not-implemented");
}

export function composeLikesTweet(postAuthor, postId, amountStaked, staker) {
  throw new Error("not-implemented");
}

export function composeMentionedTweet(mentioned, mentionedBy, postId) {
  throw new Error("not-implemented");
}

export function composeMyHowlTweet(postAuthor, postId, postBody, mentions) {
  for (const mention of mentions) {
    postBody = postBody.replaceAll(
      "@" + mention,
      new URL(encodeURIComponent(mention), HOWL_URL).toString()
    );
  }

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
      mentions,
    },
  };
}
