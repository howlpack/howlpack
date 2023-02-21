import * as aws from "@pulumi/aws";

const queuePackageName = "howlpack--package-queue";

export const howl_queue = new aws.sqs.Queue(queuePackageName + "-howl", {
  messageRetentionSeconds: 300,
  visibilityTimeoutSeconds: 60,
});

export const notification_queue = new aws.sqs.Queue(queuePackageName, {
  messageRetentionSeconds: 180,
  visibilityTimeoutSeconds: 60,
});
