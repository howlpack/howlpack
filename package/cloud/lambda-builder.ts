import * as pulumi from "@pulumi/pulumi";
import { buildSync } from "esbuild";

function build(entrypoint: string, minify: boolean) {
  const result = buildSync({
    bundle: true,
    minify,
    charset: "utf8",
    platform: "node",
    target: "node18",
    mainFields: ["module", "main"],
    external: [
      "aws-sdk",
      "@aws-sdk/client-ses",
      "@aws-sdk/client-sqs",
      "@aws-sdk/client-dynamodb",
      "@aws-sdk/util-dynamodb",
      "@aws-sdk/lib-dynamodb",
    ],
    entryPoints: [entrypoint],
    write: false,
  });
  return result?.outputFiles?.[0].text ?? "";
}

export function buildCodeAsset(
  entrypoint: string,
  minify = false,
  optionalAssets = {}
) {
  return new pulumi.asset.AssetArchive({
    "index.js": new pulumi.asset.StringAsset(build(entrypoint, minify)),
    ...optionalAssets,
  });
}
