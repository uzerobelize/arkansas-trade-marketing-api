import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  out: './drizzle/migrations',
  schema: './src/db/schema.ts',
  dialect: 'postgresql', // Change to 'sqlite' or 'mysql' depending on your DB
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
