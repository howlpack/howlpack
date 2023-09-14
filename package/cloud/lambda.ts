"use strict";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { url as webappUrl } from "./webapp";
import { url as backendUrl } from "./backend";
import { buildCodeAsset } from "./lambda-builder";
import { howl_queue, notification_queue } from "./queue";
import { lastProcessedBlockTable } from "./dynamo";

const projectConfig = new pulumi.Config("pulumi");
const howlpackConfig = new pulumi.Config("howlpack");
const junoConfig = new pulumi.Config("juno");
const twitterConfig = new pulumi.Config("twitter");
const backendConfig = new pulumi.Config("backend");

const names = JSON.parse(projectConfig.require("env_files")) || [];

const environment = names.reduce(
  (res: any, path: string) => ({
    ...res,
    ...dotenv.config({ path }).parsed,
  }),
  {}
);

const lambdaPackageName = "howlpack--package-lambda";

const lambdaRole = new aws.iam.Role(lambdaPackageName, {
  assumeRolePolicy: {
    Version: "2012-10-17",
    Statement: [
      {
        Action: "sts:AssumeRole",
        Principal: {
          Service: "lambda.amazonaws.com",
        },
        Effect: "Allow",
        Sid: "",
      },
    ],
  },
});

const sesLambdaPolicy = new aws.iam.Policy(lambdaPackageName + "-ses", {
  policy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Action: ["ses:SendEmail", "ses:SendRawEmail"],
        Resource: "arn:aws:ses:eu-west-1:585648147442:identity/howlpack.social",
        Condition: {
          StringLike: {
            "ses:FromAddress": "notification@howlpack.social",
          },
        },
      },
    ],
  }),
});

const sqsLambdaPolicy = new aws.iam.Policy(lambdaPackageName + "-sqs", {
  policy: pulumi
    .all([notification_queue.arn, howl_queue.arn])
    .apply(([notification_arn, howl_arn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: [
              "sqs:SendMessage",
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ],
            Resource: notification_arn,
          },
          {
            Effect: "Allow",
            Action: [
              "sqs:SendMessage",
              "sqs:ReceiveMessage",
              "sqs:DeleteMessage",
              "sqs:GetQueueAttributes",
            ],
            Resource: howl_arn,
          },
        ],
      })
    ),
});

const dynamoLambdaPolicy = new aws.iam.Policy(lambdaPackageName + "-dynamo", {
  policy: lastProcessedBlockTable.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "dynamodb:List*",
            "dynamodb:DescribeReservedCapacity*",
            "dynamodb:DescribeLimits",
            "dynamodb:DescribeTimeToLive",
          ],
          Resource: "*",
        },
        {
          Effect: "Allow",
          Action: [
            "dynamodb:BatchGet*",
            "dynamodb:DescribeStream",
            "dynamodb:DescribeTable",
            "dynamodb:Get*",
            "dynamodb:Query",
            "dynamodb:Scan",
            "dynamodb:BatchWrite*",
            "dynamodb:CreateTable",
            "dynamodb:Delete*",
            "dynamodb:Update*",
            "dynamodb:PutItem",
          ],
          Resource: arn,
        },
      ],
    })
  ),
});

new aws.iam.RolePolicyAttachment(lambdaPackageName + "-lambdaExecute", {
  role: lambdaRole,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
});

new aws.iam.RolePolicyAttachment(lambdaPackageName + "-sesPolicy", {
  role: lambdaRole,
  policyArn: sesLambdaPolicy.arn,
});

new aws.iam.RolePolicyAttachment(lambdaPackageName + "-sqsPolicy", {
  role: lambdaRole,
  policyArn: sqsLambdaPolicy.arn,
});

new aws.iam.RolePolicyAttachment(lambdaPackageName + "-dynamoPolicy", {
  role: lambdaRole,
  policyArn: dynamoLambdaPolicy.arn,
});

export const apiBackend = new aws.lambda.Function(
  lambdaPackageName + "-apiBackend",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-backend/serverless.js"),
      true
    ),
    handler: "index.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    timeout: 30,
    memorySize: 512,
    environment: {
      variables: {
        ...environment,
        FRONTEND_URL: webappUrl,
        BACKEND_URL: "https://" + backendConfig.require("API_DOMAIN"),
        ENCRYPTION_SECRET_KEY: howlpackConfig.getSecret(
          "ENCRYPTION_SECRET_KEY"
        ),
        WINSTON_WOLFE_KEY: howlpackConfig.getSecret("WINSTON_WOLFE_KEY"),
        HOWL_POSTS_ADDR: junoConfig.get("howl_posts"),
        HOWL_STAKING: junoConfig.get("howl_staking"),
        HOWL_TOKEN: junoConfig.get("howl_token"),
        HOWL_MNEMONIC: howlpackConfig.getSecret("HOWL_MNEMONIC"),
        NOTIFICATIONS_CONTRACT: junoConfig.get("notifications_contract"),
        TWITTER_CLIENT_ID: twitterConfig.get("client_id"),
        TWITTER_CLIENT_SECRET: twitterConfig.getSecret("client_secret"),
        TWITTER_CODE_CHALLENGE: twitterConfig.getSecret("code_challenge"),
        ROLLBAR_ACCESS_TOKEN: howlpackConfig.getSecret("ROLLBAR_ACCESS_TOKEN"),
        RPC_ENDPOINTS: (JSON.parse(junoConfig.require("rpcs")) || []).join(","),
      },
    },
  }
);

export const howlProcessor = new aws.lambda.Function(
  lambdaPackageName + "-howlProcessor",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-processor/howl.js"),
      true
    ),
    handler: "index.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    timeout: 60,
    memorySize: 512,
    environment: {
      variables: {
        ...environment,
        RPC_ENDPOINTS: (JSON.parse(junoConfig.require("rpcs")) || []).join(","),
        NOTIFICATIONS_CONTRACT: junoConfig.get("notifications_contract"),
        NOTIFICATION_QUEUE_URL: notification_queue.url,
        ENCRYPTION_SECRET_KEY: howlpackConfig.getSecret(
          "ENCRYPTION_SECRET_KEY"
        ),
      },
    },
  }
);

new aws.lambda.EventSourceMapping(lambdaPackageName + "-howl", {
  eventSourceArn: howl_queue.arn,
  functionName: howlProcessor.arn,
});

export const notificationsProcessor = new aws.lambda.Function(
  lambdaPackageName + "-notificationsProcessor",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-processor/notifications.js"),
      true
    ),
    handler: "index.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    timeout: 10,
    memorySize: 128,
    environment: {
      variables: {
        ...environment,
      },
    },
  }
);

new aws.lambda.EventSourceMapping(lambdaPackageName + "-notifications", {
  eventSourceArn: notification_queue.arn,
  functionName: notificationsProcessor.arn,
});

const cronRule = new aws.cloudwatch.EventRule(lambdaPackageName + "-cron", {
  scheduleExpression: "rate(1 minute)",
});

export const watcher = new aws.lambda.Function(lambdaPackageName + "-watcher", {
  code: buildCodeAsset(
    require.resolve("@howlpack/howlpack-watcher/index.js"),
    true
  ),
  handler: "index.handler",
  runtime: "nodejs18.x",
  role: lambdaRole.arn,
  timeout: 55,
  memorySize: 512,
  environment: {
    variables: {
      ...environment,
      FRONTEND_URL: webappUrl,
      BACKEND_URL: backendUrl,
      RPC_ENDPOINTS: (JSON.parse(junoConfig.require("rpcs")) || []).join(","),
      NOTIFICATIONS_CONTRACT: junoConfig.get("notifications_contract"),
      HOWL_POSTS_ADDR: junoConfig.get("howl_posts"),
      HOWL_TOKEN: junoConfig.get("howl_token"),
      HOWL_STAKING: junoConfig.get("howl_staking"),
      DYNAMO_LAST_PROCESSED_TABLE: lastProcessedBlockTable.name,
      HOWL_QUEUE_URL: howl_queue.url,
    },
  },
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronTarget = new aws.cloudwatch.EventTarget(lambdaPackageName, {
  arn: watcher.arn,
  rule: cronRule.name,
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronPermission = new aws.lambda.Permission(
  lambdaPackageName + "-watcher",
  {
    action: "lambda:InvokeFunction",
    function: watcher.name,
    principal: "events.amazonaws.com",
    sourceArn: cronRule.arn,
  }
);

export const winstonWolfe = new aws.lambda.Function(
  lambdaPackageName + "-winstonWolfe",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-bot/winston-wolfe.js"),
      true
    ),
    handler: "index.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    timeout: 55,
    memorySize: 512,
    environment: {
      variables: {
        ...environment,
        FRONTEND_URL: webappUrl,
        BACKEND_URL: backendUrl,
        RPC_ENDPOINTS: (JSON.parse(junoConfig.require("rpcs")) || []).join(","),
        HOWL_TOKEN: junoConfig.get("howl_token"),
        HOWL_STAKING: junoConfig.get("howl_staking"),
        HOWL_MNEMONIC: howlpackConfig.getSecret("HOWL_MNEMONIC"),
      },
    },
  }
);

const cronWinstonRule = new aws.cloudwatch.EventRule(
  lambdaPackageName + "-cronWinston",
  {
    scheduleExpression: "rate(1 day)",
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronWinstonPermission = new aws.lambda.Permission(
  lambdaPackageName + "-winston",
  {
    action: "lambda:InvokeFunction",
    function: winstonWolfe.name,
    principal: "events.amazonaws.com",
    sourceArn: cronWinstonRule.arn,
  }
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronWinstonTarget = new aws.cloudwatch.EventTarget(
  lambdaPackageName + "-winston",
  {
    arn: winstonWolfe.arn,
    rule: cronWinstonRule.name,
  }
);
