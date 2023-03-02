import { handler } from "./howl.js";

handler({
  Records: [
    {
      body: JSON.stringify({
        receiver: "howlpack",
        event: "my-howl",
        attrs: {
          postId: "b71444c7-2f57-4dae-b605-8089fdfc8db1",
          postBody: "tweet",
        },
      }),
    },
  ],
});
