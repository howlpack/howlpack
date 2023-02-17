import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const client = new SESClient({
  region: "eu-west-1",
});

const source = "notification@howlpack.social";

export async function handler(event) {
  for (const record of event.Records) {
    const { body } = record;
    const parsedBody = JSON.parse(body);

    const command = new SendEmailCommand({
      Destination: {
        ToAddresses: [parsedBody.to],
      },
      Message: {
        Body: {
          Text: {
            Charset: "UTF-8",
            Data: parsedBody.body,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: parsedBody.subject,
        },
      },
      Source: source,
    });

    await client.send(command);
  }

  return {};
}
