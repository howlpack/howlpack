import * as aws from "@pulumi/aws";

const queuePackageName = "howlpack--package-queue";

export const notification_queue = new aws.sqs.Queue(queuePackageName, {
  messageRetentionSeconds: 600,
});
