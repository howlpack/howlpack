import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const lastProcessedBlockTable = new aws.dynamodb.Table(
  pulumi.getStack() + ".LastProcessedBlock",
  {
    attributes: [
      {
        name: "id",
        type: "S",
      },
    ],
    readCapacity: 1,
    writeCapacity: 1,
    hashKey: "id",
    tags: {
      Environment: pulumi.getStack(),
    },
  }
);

export const twitterTable = new aws.dynamodb.Table(
  pulumi.getStack() + ".Twitter",
  {
    attributes: [
      {
        name: "dens",
        type: "S",
      },
    ],
    readCapacity: 1,
    writeCapacity: 1,
    hashKey: "dens",
    tags: {
      Environment: pulumi.getStack(),
    },
  }
);
