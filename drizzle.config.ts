import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load the same environment variables Next.js uses
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
