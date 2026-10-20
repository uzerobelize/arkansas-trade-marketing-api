import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('CRITICAL: DATABASE_URL environment variable is not set.');
}

// 1. Create mysql2 Connection Pool
const poolConnection = mysql.createPool({
  uri: connectionString,
  connectionLimit: process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS) : 10,
  waitForConnections: true,
  queueLimit: 0,
});

const isDev = process.env.NODE_ENV !== 'production';

// 2. Initialize Drizzle with MySQL driver
export const db = drizzle(poolConnection, { schema, mode: 'default', logger: isDev });
