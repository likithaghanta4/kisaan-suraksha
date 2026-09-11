/**
 * AgriRaksha AI — PostgreSQL Database Pool & OTP Schema Management
 * 
 * Provides connection pooling and auto-initialization for OTP verification storage.
 */

import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;
let isConnected = false;

/**
 * Build PostgreSQL Pool Configuration
 */
const getPoolConfig = (): PoolConfig => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.includes('localhost')
        ? { rejectUnauthorized: false }
        : false,
    };
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: parseInt(process.env.PGPORT || '5432', 10),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'agriraksha',
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
};

/**
 * Initialize PostgreSQL connection pool and verify/create OTP table
 */
export const initPostgres = async (): Promise<boolean> => {
  try {
    if (!pool) {
      pool = new Pool(getPoolConfig());

      pool.on('error', (err) => {
        console.error('[PostgreSQL] Unexpected error on idle client:', err.message);
      });
    }

    // Test connection
    const client = await pool.connect();
    try {
      // Create otp_verifications table if not already existing
      await client.query(`
        CREATE TABLE IF NOT EXISTS otp_verifications (
          id SERIAL PRIMARY KEY,
          mobile_number VARCHAR(15) NOT NULL,
          otp_hash VARCHAR(255) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          attempts INT DEFAULT 0,
          verified_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_otp_verifications_mobile ON otp_verifications(mobile_number);
      `);

      isConnected = true;
      console.log('[PostgreSQL] Connected successfully. OTP verifications table is ready.');
      return true;
    } finally {
      client.release();
    }
  } catch (error: any) {
    isConnected = false;
    console.warn(`[PostgreSQL] Note: PostgreSQL connection not established (${error.message}). In-memory encrypted OTP fallback will be active if database is offline.`);
    return false;
  }
};

/**
 * Execute parameterized query on PostgreSQL pool
 */
export const query = async <T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T> | null> => {
  if (!pool) {
    await initPostgres();
  }

  if (!pool || !isConnected) {
    return null;
  }

  try {
    return await pool.query<T>(text, params);
  } catch (err: any) {
    console.error('[PostgreSQL] Query execution error:', err.message);
    throw err;
  }
};

/**
 * Check if PostgreSQL is actively connected
 */
export const isPostgresAvailable = (): boolean => isConnected;

export default {
  initPostgres,
  query,
  isPostgresAvailable,
};
