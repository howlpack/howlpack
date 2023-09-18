import { Client, auth } from "twitter-api-sdk";
import { backOff } from "exponential-backoff";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbClient, ddbDocClient } from "./dynamo.js";

/**
 * A number, or a string containing a number.
 * @typedef {{
 *   refresh_token?: string;
 *   access_token?: string;
 *   token_type?: string;
 *   expires_at?: number;
 *   scope?: string;
 * }} TwitterToken
 */

export const authClient = new auth.OAuth2User({
  client_id: process.env.TWITTER_CLIENT_ID,
  client_secret: process.env.TWITTER_CLIENT_SECRET,
  callback: new URL("/api/twitter/callback", process.env.BACKEND_URL),
  scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
});

export const client = new Client(authClient);

/**
 *
 * @param {string} dens
 * @returns {import("twitter-api-sdk/dist/gen/openapi-types.js").components['schemas']['User'] | null}
 */
export async function getTwitterUser(dens) {
  const _data = await ddbClient.send(
    new GetItemCommand({
      TableName: process.env.DYNAMO_TWITTER_TABLE,
      Key: marshall({
        dens: dens,
      }),
      ProjectionExpression: "#user",
      ExpressionAttributeNames: {
        "#user": "user",
      },
    })
  );

  if (!_data.Item) {
    return null;
  }

  return unmarshall(_data.Item).user;
}

/**
 *
 * @param {string} dens
 * @returns {TwitterToken | null}
 */
export async function getAuthToken(dens) {
  const _data = await ddbClient.send(
    new GetItemCommand({
      TableName: process.env.DYNAMO_TWITTER_TABLE,
      Key: marshall({
        dens: dens,
      }),
      ProjectionExpression: "#token",
      ExpressionAttributeNames: {
        "#token": "token",
      },
    })
  );

  if (!_data.Item) {
    return null;
  }

  /** @type {TwitterToken} */
  return unmarshall(_data.Item).token;
}

/**
 *
 * @param {string} dens
 * @param {import("twitter-api-sdk/dist/OAuth2User.js").OAuth2User} authClient
 */
export async function setAuthTokenFromDB(dens, authClient, force = false) {
  let token = await getAuthToken(dens);

  if (!token) {
    return [false, null];
  }

  authClient.token = token;

  if (authClient.isAccessTokenExpired() || force) {
    let refreshedToken;
    try {
      const { token } = await backOff(() => authClient.refreshAccessToken(), {
        numOfAttempts: 3,
      });
      refreshedToken = token;
    } catch (e) {
      console.error("twitter error", e);

      await ddbDocClient.send(
        new DeleteCommand({
          TableName: process.env.DYNAMO_TWITTER_TABLE,
          Key: {
            dens: dens,
          },
        })
      );

      return [false, null];
    }

    await backOff(
      () =>
        ddbDocClient.send(
          new UpdateCommand({
            TableName: process.env.DYNAMO_TWITTER_TABLE,
            Key: {
              dens: dens,
            },
            UpdateExpression: "set #token = :token",
            ExpressionAttributeValues: {
              ":token": refreshedToken,
            },
            ExpressionAttributeNames: {
              "#token": "token",
            },
            ReturnValues: "NONE",
          })
        ),
      {
        numOfAttempts: 3,
      }
    );
  }

  return [true, authClient.token];
}
