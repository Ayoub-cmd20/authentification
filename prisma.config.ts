import path from 'node:path';
import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join('apps', 'api', 'prisma', 'schema.prisma'),
  datasourceUrl: process.env.DATABASE_URL!,
});
