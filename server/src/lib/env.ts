import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  PORT: z.string().optional(),
  SEED_DEMO_ON_START: z.string().optional()
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

const seedDemoFromEnv = parsed.data.SEED_DEMO_ON_START?.toLowerCase();
const shouldSeedDemo =
  seedDemoFromEnv === "true"
    ? true
    : seedDemoFromEnv === "false"
      ? false
      : process.env.NODE_ENV !== "production";

export const env = {
  DATABASE_URL: parsed.data.DATABASE_URL,
  JWT_SECRET: parsed.data.JWT_SECRET,
  PORT: parsed.data.PORT ? Number(parsed.data.PORT) : 3000,
  SEED_DEMO_ON_START: shouldSeedDemo
};
