import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@shared/schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    return db;
  }

  try {
    // Test the connection
    await pool.query('SELECT 1');
    isConnected = true;
    console.log('Connected to PostgreSQL successfully');
    return db;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw new Error('Failed to connect to PostgreSQL database.');
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('PostgreSQL connection closed through app termination');
  process.exit(0);
});

export { pool };