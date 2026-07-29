import mongoose from 'mongoose';

let isConnected = false;
let connectionListenersSet = false;

const setupConnectionListeners = () => {
  if (connectionListenersSet) return;
  connectionListenersSet = true;

  const conn = mongoose.connection;

  conn.on('connected', () => {
    isConnected = true;
    console.log('[MONGODB] Connection established successfully.');
  });

  conn.on('error', (err) => {
    console.error('[MONGODB] Connection runtime error:', err.message);
  });

  conn.on('disconnected', () => {
    isConnected = false;
    console.warn('[MONGODB] Connection lost/disconnected.');
  });

  conn.on('reconnected', () => {
    isConnected = true;
    console.log('[MONGODB] Connection re-established successfully.');
  });
};

/**
 * Enterprise MongoDB Connection Handler with Pooling, Retry & Fail-Fast in Production.
 */
export const connectDB = async (): Promise<boolean> => {
  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  setupConnectionListeners();

  const MONGODB_URI = process.env.MONGODB_URI || '';
  const isProduction = process.env.NODE_ENV === 'production';

  if (!MONGODB_URI) {
    if (isProduction) {
      console.error('[FATAL MONGODB ERROR] MONGODB_URI environment variable is strictly required in production.');
      throw new Error('MONGODB_URI environment variable is missing in production.');
    }
    console.warn('[DEV NOTICE] No MONGODB_URI provided. Fallback to embedded JSON store enabled for local dev.');
    return false;
  }

  try {
    console.log('[MONGODB] Initializing connection with connection pooling...');
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
      autoIndex: !isProduction, // Enable autoIndex only in dev/test to avoid production performance impact
    });

    isConnected = mongoose.connection.readyState === 1;
    return isConnected;
  } catch (error: any) {
    isConnected = false;
    console.error('[MONGODB] Connection failed:', error.message);

    if (isProduction) {
      console.error('[FATAL MONGODB ERROR] Production database connection failed. Halting application boot.');
      throw new Error(`Production database connection failed: ${error.message}`);
    }

    console.warn('[DEV NOTICE] Fallback to embedded JSON store enabled for local dev due to connection failure.');
    return false;
  }
};

/**
 * Graceful Database Disconnect
 */
export const disconnectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState !== 0) {
    try {
      await mongoose.disconnect();
      isConnected = false;
      console.log('[MONGODB] Disconnected gracefully.');
    } catch (err: any) {
      console.error('[MONGODB] Error during disconnect:', err.message);
    }
  }
};

/**
 * Connection Status Inspector
 */
export const isMongoConnected = (): boolean => {
  return isConnected && mongoose.connection.readyState === 1;
};

/**
 * MongoDB Health Monitor Metrics
 */
export const getMongoHealth = async () => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = {
    connected: readyState === 1,
    state: states[readyState] || 'unknown',
    readyState,
    host: mongoose.connection.host || 'none',
    port: mongoose.connection.port || null,
    name: mongoose.connection.name || null,
    pingMs: null as number | null,
  };

  if (status.connected && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      status.pingMs = Date.now() - start;
    } catch (e) {
      status.connected = false;
    }
  }

  return status;
};

