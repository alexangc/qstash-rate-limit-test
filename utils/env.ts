import fs from "fs";
import path from "path";
import dotenv from "dotenv";

export function maybeLoadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  const envExists = fs.existsSync(envPath);
  if (envExists) {
    dotenv.config({ path: envPath });
  }

  return envExists;
}
