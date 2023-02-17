"use strict";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { url as webappUrl } from "./webapp";
import { url as backendUrl } from "./backend";
import { buildCodeAsset } from "./lambda-builder";
import { notification_queue } from "./queue";
import { lastProcessedBlockTable } from "./dynamo";

const projectConfig = new pulumi.Config("pulumi");
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
        Resource:
          "arn:aws:ses:eu-central-1:585648147442:identity/howlpack.social",
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
  policy: notification_queue.arn.apply((arn) =>
    JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: [
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes",
          ],
          Resource: arn,
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
      require.resolve("@howlpack/howlpack-backend/serverless.js")
    ),
    handler: "index.handler",
    runtime: "nodejs18.x",
    role: lambdaRole.arn,
    timeout: 30,
    memorySize: 128,
    environment: {
      variables: {
        ...environment,
        FRONTEND_URL: webappUrl,
        BACKEND_URL: backendUrl,
      },
    },
  }
);

export const emailProcessor = new aws.lambda.Function(
  lambdaPackageName + "-emailProcessor",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-processor/index.js")
    ),
    handler: "index.email.handler",
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

new aws.lambda.EventSourceMapping(lambdaPackageName + "-notificationEmail", {
  eventSourceArn: notification_queue.arn,
  functionName: emailProcessor.arn,
  filterCriteria: {
    filters: [
      {
        pattern: JSON.stringify({
          body: {
            type: ["email"],
          },
        }),
      },
    ],
  },
});

export const processor = new aws.lambda.Function(
  lambdaPackageName + "-processor",
  {
    code: buildCodeAsset(
      require.resolve("@howlpack/howlpack-processor/index.js")
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
      },
    },
  }
);

const cronRule = new aws.cloudwatch.EventRule(lambdaPackageName + "-cron", {
  scheduleExpression: "rate(1 minute)",
});

export const watcher = new aws.lambda.Function(lambdaPackageName + "-watcher", {
  code: buildCodeAsset(require.resolve("@howlpack/howlpack-watcher/index.js")),
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
      RPC_ENDPOINT: "https://juno-rpc.reece.sh/",
      DYNAMO_LAST_PROCESSED_TABLE: lastProcessedBlockTable.name,
    },
  },
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cronTarget = new aws.cloudwatch.EventTarget(lambdaPackageName, {
  arn: watcher.arn,
  rule: cronRule.name,
});
