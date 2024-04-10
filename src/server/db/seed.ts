import "dotenv/config";
import { env } from "@/env";
import migration from "./migration";

if (!env.DATABASE_URL) throw new Error("DATABASE_URL not found on .env");
if (!env.DB_SEED_USER_ID) throw new Error("DB_SEED_USER_ID not found on .env");
const main = async () => {
  console.log("Seed start");
  await migration();
  console.log("Seed done");
};

await main();
