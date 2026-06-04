import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT: z.coerce.number().default(4000),
  WEB_APP_URL: z.string().url().default("http://localhost:5173"),
  WEB_APP_URLS: z.string().optional(),
  UPLOAD_DIR: z.string().default("apps/api/uploads"),
  MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  HASH_SECRET: z.string().min(32, "HASH_SECRET must be at least 32 characters"),
  FILE_ENCRYPTION_KEY: z.string().min(32, "FILE_ENCRYPTION_KEY must be at least 32 characters").default("local-dev-file-encryption-key-32b"),
  BLOCKCHAIN_ENABLED: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  BLOCKCHAIN_RPC_URL: z.string().default("http://127.0.0.1:8545"),
  BLOCKCHAIN_PRIVATE_KEY: z.string().optional(),
  BLOCKCHAIN_CONTRACT_ADDRESS: z.string().optional(),
  BLOCKCHAIN_NETWORK: z.string().default("hardhat")
});

export const env = envSchema.parse(process.env);

export const webOrigins = (env.WEB_APP_URLS ?? env.WEB_APP_URL)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
