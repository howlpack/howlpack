import { handler } from "./howl.js";

handler({
  Records: [
    {
      body: JSON.stringify({
        receiver: "howlpack",
        event: "new-like",
        attrs: {
          postId: "3ab40fb0-c51f-44c2-accb-b8a87aaed9bc",
          staker: "howlpack-test",
          amount: "100",
        },
      }),
    },
  ],
});
