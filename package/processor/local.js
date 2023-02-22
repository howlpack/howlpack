import { EVENT_TYPES } from "@howlpack/howlpack-shared/constants.js";
import { handler } from "./howl.js";

handler({
  Records: [
    {
      body: JSON.stringify({
        receiver: "howlpack",
        event: "new-like",
        attrs: {
          postId: "ab0f1449-0f21-4a76-b001-439e80051161",
          amount: "10",
          staker: "howlpack",
        },
      }),
    },
  ],
});
