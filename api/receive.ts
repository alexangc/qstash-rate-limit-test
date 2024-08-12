import { VercelRequest, VercelResponse } from "@vercel/node";
import { maybeLoadEnv } from "../utils/env.js";
// import { waitUntil } from '@vercel/functions';

maybeLoadEnv();

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("POST only");
  }

  console.log("Received messag", req.body);

  return res.json({ message: "receive.ts" });
}
