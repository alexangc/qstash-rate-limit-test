import { VercelRequest, VercelResponse } from "@vercel/node";
// import { waitUntil } from '@vercel/functions';

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("POST only");
  }

  return res.json({ message: "receive.ts" });
}
