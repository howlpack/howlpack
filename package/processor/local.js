import { handler } from "./howl.js";

handler({
  Records: [
    {
      body: JSON.stringify({
        receiver: "howlpack",
        event: "my-howl",
        attrs: {
          postId: "2d133620-ee0e-47ea-8476-a1a7794574db",
          postBody:
            "We just released a new event type for Howlpack - 'My Published Howls'. https://get.howlpack.social/ #howlpack ",
          mentions: [],
        },
      }),
    },
  ],
});

// import { handler } from "./notifications.js";
// handler({
//   Records: [
//     {
//       body: JSON.stringify({
//         body: {
//           postAuthor: "howlpack",
//           postAuthorUrl: "https://beta.howl.social/howlpack",
//           postId: "2d133620-ee0e-47ea-8476-a1a7794574db",
//           postUrl:
//             "https://beta.howl.social/howlpack/2d133620-ee0e-47ea-8476-a1a7794574db",
//           postBody:
//             "We just released a new event type for Howlpack - 'My Published Howls'. https://get.howlpack.social/ #howlpack ",
//           mentions: [],
//         },
//         event_type: "my-howl",
//         type: "twitter",
//       }),
//     },
//   ],
// });
