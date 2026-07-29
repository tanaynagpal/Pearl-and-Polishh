import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer as createViteServer } from 'vite';

import { connectDB, disconnectDB, isMongoConnected } from './server/config/db';
import { Store } from './server/services/store';

import { sanitizeInputs } from './server/middleware/securityMiddleware';

import authRoutes from './server/routes/authRoutes';
import productRoutes from './server/routes/productRoutes';
import orderRoutes from './server/routes/orderRoutes';
import appointmentRoutes from './server/routes/appointmentRoutes';
import contactRoutes from './server/routes/contactRoutes';
import settingsRoutes from './server/routes/settingsRoutes';
import userRoutes from './server/routes/userRoutes';
import uploadRoutes from './server/routes/uploadRoutes';
import healthRoutes from './server/routes/healthRoutes';

// Validate required environment variables before booting
function validateEnvironmentVariables() {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'MONGODB_URI'];
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      console.error(`\n[FATAL STARTUP ERROR] Missing required production environment variable(s): ${missing.join(', ')}`);
      console.error(`Please set ${missing.join(', ')} in environment configuration before starting in production.\n`);
      process.exit(1);
    }
  } else {
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      console.warn('\n[DEV NOTICE] Running with standard development JWT secrets. Configure JWT_SECRET and JWT_REFRESH_SECRET in .env for custom keys.\n');
    }
  }
  if (!process.env.GOOGLE_CLIENT_ID && !process.env.VITE_GOOGLE_CLIENT_ID) {
    console.warn('[OAUTH NOTICE] GOOGLE_CLIENT_ID environment variable is missing. Set GOOGLE_CLIENT_ID in .env to enable Google Sign-In.');
  }

  const rawAdminEmails =
    process.env.ADMIN_GOOGLE_EMAILS ||
    'tanaynagpal5@gmail.com,maanvinagpal18@gmail.com,maanvinagpal1@gmail.com';
  console.log(`[AUTH CONFIG] Admin Google Sign-In Whitelist loaded: [${rawAdminEmails}]`);
}

async function startServer() {
  validateEnvironmentVariables();

  const app = express();
  const PORT = 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  // Disable 'X-Powered-By' header to prevent tech stack fingerprinting
  app.disable('x-powered-by');

  // Trust reverse proxy headers (Render, Railway, Cloud Run, Nginx)
  app.set('trust proxy', 1);

  // Database Connection & Initial Seed
  await connectDB();
  await Store.initSeed();

  // Enable Strong ETags for caching verification
  app.set('etag', 'strong');

  // Security Headers via Helmet
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                'https://www.googletagmanager.com',
                'https://www.clarity.ms',
                'https://connect.facebook.net',
              ],
              styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
              fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
              imgSrc: [
                "'self'",
                'data:',
                'blob:',
                'https://res.cloudinary.com',
                'https://images.unsplash.com',
                'https://lh3.googleusercontent.com',
                'https://www.google-analytics.com',
                'https://c.clarity.ms',
              ],
              connectSrc: [
                "'self'",
                'https://res.cloudinary.com',
                'https://www.google-analytics.com',
                'https://*.clarity.ms',
              ],
              frameAncestors: ["'none'"],
              objectSrc: ["'none'"],
              upgradeInsecureRequests: [],
            },
          }
        : false,
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })
  );

  // Custom Permissions-Policy Header
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Response Compression
  app.use(compression());

  // HTTP Request Logging
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  // CORS Configuration
  const allowedOrigins = new Set<string>([
    'https://pearlandpolish.com',
    'https://www.pearlandpolish.com',
  ]);

  if (process.env.CLIENT_URL) {
    allowedOrigins.add(process.env.CLIENT_URL.trim());
  }
  if (process.env.APP_URL) {
    allowedOrigins.add(process.env.APP_URL.trim());
  }

  if (!isProduction) {
    allowedOrigins.add('http://localhost:5173');
    allowedOrigins.add('http://127.0.0.1:5173');
    allowedOrigins.add('http://localhost:3000');
    allowedOrigins.add('http://127.0.0.1:3000');
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) {
          return callback(null, true);
        }
        // Allow dynamic localhost or local dev IP in non-production
        if (!isProduction && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy error: Origin ${origin} is not allowed.`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Request Parsers & Sanitization
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(sanitizeInputs);

  // Rate Limiters
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many authentication attempts. Please try again later.',
    },
  });

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', apiLimiter);

  // API Routes
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/appointments', appointmentRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/health', healthRoutes);

  // Frontend Assets or Vite Middleware
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    // Serve immutable built static JS/CSS assets with 1-year max-age caching
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );

    // Serve general static files (favicons, manifest, images)
    app.use(
      express.static(distPath, {
        maxAge: '1d',
        etag: true,
      })
    );

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 404 Handler for Unmatched Routes
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.path}`,
    });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[UNHANDLED SERVER ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      message: isProduction ? 'Internal Server Error' : err.message || 'Server Exception',
    });
  });

  // Start HTTP Server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
==================================================
  Pearl & Polishh Atelier Full-Stack Server
==================================================
  Environment : ${process.env.NODE_ENV || 'development'}
  Listening   : http://0.0.0.0:${PORT}
  Database    : ${isMongoConnected() ? 'MongoDB Cloud' : 'Embedded JSON Store'}
==================================================
`);
  });

  // Graceful Shutdown Handler
  const shutdown = (signal: string) => {
    console.log(`\n[SYSTEM] ${signal} signal received. Closing HTTP server gracefully...`);
    server.close(async () => {
      console.log('[SYSTEM] HTTP server closed.');
      await disconnectDB();
      console.log('[SYSTEM] Process exiting gracefully.');
      process.exit(0);
    });

    // Force exit after 10s timeout
    setTimeout(() => {
      console.error('[SYSTEM] Forced shutdown timeout expired.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Global Uncaught Exception & Unhandled Rejection Handlers
  process.on('unhandledRejection', (reason: any) => {
    console.error('[UNHANDLED REJECTION]', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('[UNCAUGHT EXCEPTION]', error);
    // Gracefully shut down on uncaught exception in production
    if (process.env.NODE_ENV === 'production') {
      shutdown('UNCAUGHT_EXCEPTION');
    }
  });
}

startServer().catch((error) => {
  console.error('[FATAL SERVER STARTUP FAILURE]', error);
  process.exit(1);
});
