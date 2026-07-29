import { Request, Response } from 'express';
import { isMongoConnected } from '../config/db';

/**
 * Health Check Overview
 */
export const getHealth = (req: Request, res: Response) => {
  const isDbReady = isMongoConnected();
  const uptimeSeconds = Math.floor(process.uptime());
  const memoryUsage = process.memoryUsage();

  res.status(200).json({
    success: true,
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    uptime: `${uptimeSeconds}s`,
    database: isDbReady ? 'connected' : 'local_file_store',
    memory: {
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    },
    timestamp: new Date().toISOString(),
  });
};

/**
 * Liveness Probe (Kubernetes / Cloud Run liveness probe)
 */
export const getLiveness = (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Readiness Probe (Kubernetes / Cloud Run readiness probe)
 */
export const getReadiness = (_req: Request, res: Response) => {
  // Application is ready if DB or local storage service is operating
  res.status(200).json({
    status: 'ready',
    databaseConnected: isMongoConnected(),
    timestamp: new Date().toISOString(),
  });
};

/**
 * Performance Metrics
 */
export const getMetrics = (_req: Request, res: Response) => {
  const memory = process.memoryUsage();
  const cpu = process.cpuUsage();

  res.status(200).json({
    success: true,
    metrics: {
      uptimeSeconds: process.uptime(),
      memory: {
        rssBytes: memory.rss,
        heapTotalBytes: memory.heapTotal,
        heapUsedBytes: memory.heapUsed,
        externalBytes: memory.external,
      },
      cpu: {
        userMicroseconds: cpu.user,
        systemMicroseconds: cpu.system,
      },
      nodeVersion: process.version,
      pid: process.pid,
    },
    timestamp: new Date().toISOString(),
  });
};
