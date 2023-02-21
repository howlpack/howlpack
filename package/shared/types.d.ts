export type DecodedMsgExecuteContract = {
  sender: string;
  contract: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any;
  funds: Coin[];
  hex: string;
};

export type HowlFollowerQueueMsg = {
  receiver: string;
  event: "new-follower";
  attrs: {
    follower: string;
    hex: string;
  };
};

export type HowlReplyQueueMsg = {
  receiver: string;
  event: "new-reply";
  attrs: {
    postId: string;
    replyId: string;
    replyAuthor: string;
  };
};
