// src/db.ts
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";
import "dotenv/config";

// 1. Validate required Hostinger credentials
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error(
    "CRITICAL: Hostinger Database credentials are missing in .env",
  );
}

// 2. Create mysql2 Connection Pool with Hostinger parameters
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Hostinger shared/VPS plans have strict connection limits. Keep this low (5-10).
  connectionLimit: process.env.DB_MAX_CONNECTIONS
    ? parseInt(process.env.DB_MAX_CONNECTIONS)
    : 5,
  waitForConnections: true,
  queueLimit: 0,
  timezone: '+00:00',

  // Uncomment the ssl block below if you are connecting remotely from your local machine
  // to Hostinger and they require a secure connection:
  // ssl: { rejectUnauthorized: false }
});

const isDev = process.env.NODE_ENV !== "production";

// 3. Initialize Drizzle
export const db = drizzle(poolConnection, {
  schema,
  mode: "default",
  logger: isDev,
});
