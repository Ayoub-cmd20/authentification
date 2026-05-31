import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

const key = crypto.createHash("sha256").update(env.FILE_ENCRYPTION_KEY).digest();

export const sha256File = async (filePath: string) => {
  const file = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(file).digest("hex");
};

export const encryptLocalFile = async (plainPath: string) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const input = await fs.readFile(plainPath);
  const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const storagePath = `${plainPath}.enc`;
  await fs.writeFile(storagePath, Buffer.concat([iv, authTag, encrypted]));
  await fs.unlink(plainPath).catch(() => undefined);
  return storagePath.replaceAll("\\", "/");
};

export const decryptLocalFile = async (storagePath: string) => {
  const payload = await fs.readFile(path.resolve(storagePath));
  const iv = payload.subarray(0, 12);
  const authTag = payload.subarray(12, 28);
  const encrypted = payload.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
};
