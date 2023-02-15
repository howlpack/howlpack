"use strict";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { url as webappUrl } from "./webapp";
import { url as backendUrl } from "./backend";
import { buildCodeAsset } from "./lambda-builder";

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

new aws.iam.RolePolicyAttachment(lambdaPackageName + "-lambdaExecute", {
  role: lambdaRole,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaExecute,
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
