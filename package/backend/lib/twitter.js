import { Client, auth } from "twitter-api-sdk";

export const authClient = new auth.OAuth2User({
  client_id: process.env.TWITTER_CLIENT_ID,
  client_secret: process.env.TWITTER_CLIENT_SECRET,
  callback: new URL("/api/twitter/callback", process.env.BACKEND_URL),
  scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
});

export const client = new Client(authClient);
