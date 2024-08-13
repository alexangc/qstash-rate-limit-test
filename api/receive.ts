import { VercelRequest, VercelResponse } from "@vercel/node";
import { maybeLoadEnv } from "../utils/env.js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

maybeLoadEnv();

const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "10 s"),
  prefix: "@test-qstash-rate-limit/main",
  analytics: true,
});

export default async function (req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(400).send("POST only");
  }

  const {
    body,
    headers: { "upstash-retried": retried },
  } = req;
  const { success, remaining } = await limiter.limit("receive");

  if (!success) {
    console.log(new Date(), body, "BOUNCING", { retried, remaining });
    return res.status(429).json({ message: "Rate limit exceeded" });
  }

  console.log(new Date(), body, "Processing ...", { retried, remaining });
  await new Promise((resolve) => setTimeout(resolve, 5_000));
  console.log(new Date(), body, "Processed");

  return res.json({ message: "receive.ts" });
}
