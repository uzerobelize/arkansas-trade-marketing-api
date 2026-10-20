// db.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import 'dotenv/config'; // Automatically loads .env file

// 1. Validate Environment Variables
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('CRITICAL: DATABASE_URL environment variable is not set.');
}

// 2. Configure the Connection Pool
// Pooling is essential in production to manage multiple concurrent requests efficiently.
const pool = new Pool({
  connectionString,
  // Max number of connections in the pool (adjust based on Hostinger plan limits)
  max: process.env.DB_MAX_CONNECTIONS ? parseInt(process.env.DB_MAX_CONNECTIONS) : 10,
  // How long a connection is allowed to be idle before being closed
  idleTimeoutMillis: 30000,
  // How long to wait when requesting a new connection before timing out
  connectionTimeoutMillis: 2000,
});

// 3. Catch Idle Client Errors
// Prevents the Node.js process from crashing silently if the database disconnects unexpectedly.
pool.on('error', (err) => {
  console.error('Unexpected database error on idle client:', err);
  // In a robust production setup, you might trigger an alert here.
});

// 4. Configure Drizzle
// Enable SQL query logging only in development to save production console spam & performance.
const isDev = process.env.NODE_ENV !== 'production';

export const db = drizzle(pool, { 
  schema, 
  logger: isDev 
});
