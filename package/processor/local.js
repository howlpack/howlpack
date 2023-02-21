import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";
import { handler } from "./howl.js";

handler({
  Records: [
    {
      body: JSON.stringify({
        receiver: "howlpack",
        event: EVENT_TYPES.NEW_REPLY,
        attrs: {
          postId: "d310ea1e-f176-4c45-bf56-a24f1e042ae8",
          replyId: "d310ea1e-f176-4c45-bf56-a24f1e042ae8",
          replyAuthor: "howlpack",
        },
      }),
    },
  ],
});
