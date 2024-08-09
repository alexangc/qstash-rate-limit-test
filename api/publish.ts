import { VercelRequest, VercelResponse } from "@vercel/node";

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(400).send("GET only");
  }

  return res.json({ message: "publish.ts" });
}
