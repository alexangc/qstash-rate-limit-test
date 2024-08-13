import { VercelRequest, VercelResponse } from "@vercel/node";
import { Client } from "@upstash/qstash";
import { maybeLoadEnv } from "../utils/env.js";

maybeLoadEnv();

const client = new Client({ token: process.env.QSTASH_TOKEN as string });

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(400).send("GET only");
  }

  const url = `${process.env.API_BASE_URL}/api/receive`;
  console.log("Publishing to", url);

  // Sending 5 message with a rate limit configured to 2 in a 10s window, and
  // a maximum of 1 retry:
  // - Message 1 and 2 will succeed immediately
  // - Message 3 and 4 will bounce once and succeed on the second attempt
  // - Message 5 will bounce once and permanently fail on the second attempt
  // (Messages may not arrive in that order)
  for (let i = 1; i <= 5; i++) {
    await client.publishJSON({
      url,
      body: { id: `message-${i}` },
      retries: 1,
    });
  }

  console.log("Done publishing messages.");

  return res.json({ message: "publish.ts" });
}
