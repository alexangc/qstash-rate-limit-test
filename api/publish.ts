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

  const maybeRes = await client.publishJSON({
    url,
    body: { hello: "world" },
    // headers: { "my-header": "my-value" },
  });

  console.log("Publishing result:", maybeRes);

  return res.json({ message: "publish.ts" });
}
