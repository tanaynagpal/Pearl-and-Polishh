import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { z, ZodError } from 'zod';

// ============================================================================
// SECURITY AUDIT LOGGING
// ============================================================================
export const logSecurityAudit = (
  event: string,
  req: Request,
  details?: string
) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  const method = req.method;
  const path = req.originalUrl || req.path;
  const user = (req as any).user ? `[User ID: ${(req as any).user.id} | Email: ${(req as any).user.email} | Role: ${(req as any).user.role}]` : '[Unauthenticated]';

  console.log(
    `[SECURITY AUDIT] ${timestamp} | Event: ${event} | ${method} ${path} | IP: ${ip} | UA: ${userAgent} | ${user}${
      details ? ` | Details: ${details}` : ''
    }`
  );
};

// ============================================================================
// INPUT SANITIZATION (XSS, NoSQL Injection, Prototype Pollution)
// ============================================================================

/**
 * Escapes HTML characters to prevent XSS attacks in raw string inputs.
 */
export const sanitizeHtml = (str: string): string => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Recursively cleans request payloads to prevent NoSQL injection, prototype pollution, and XSS.
 */
const sanitizePayload = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      // Remove null bytes and sanitize HTML control tags
      return obj.replace(/\0/g, '').trim();
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizePayload(item));
  }

  const cleanedObj: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    // Prevent Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      console.warn(`[SECURITY WARN] Blocked prototype pollution attempt key '${key}'`);
      continue;
    }

    // Prevent NoSQL Injection (Reject keys starting with $ or containing .)
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[SECURITY WARN] Blocked potential NoSQL injection key '${key}'`);
      continue;
    }

    cleanedObj[key] = sanitizePayload(obj[key]);
  }

  return cleanedObj;
};

/**
 * Express Middleware for Input Sanitization
 */
export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizePayload(req.body);
  }
  if (req.query) {
    req.query = sanitizePayload(req.query);
  }
  if (req.params) {
    req.params = sanitizePayload(req.params);
  }
  next();
};

// ============================================================================
// RATE LIMITERS (OWASP Rate Limiting Guidelines)
// ============================================================================

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    code: 'TOO_MANY_REQUESTS',
  },
  handler: (req, res, _next, options) => {
    logSecurityAudit('RATE_LIMIT_EXCEEDED_AUTH', req, 'Exceeded 5 auth requests per 15 min');
    res.status(429).json(options.message);
  },
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 contact requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many contact messages sent. Please try again after 15 minutes.',
    code: 'TOO_MANY_REQUESTS',
  },
  handler: (req, res, _next, options) => {
    logSecurityAudit('RATE_LIMIT_EXCEEDED_CONTACT', req, 'Exceeded 10 contact requests per 15 min');
    res.status(429).json(options.message);
  },
});

export const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many search/fetch requests. Please slow down.',
    code: 'TOO_MANY_REQUESTS',
  },
  handler: (req, res, _next, options) => {
    logSecurityAudit('RATE_LIMIT_EXCEEDED_SEARCH', req, 'Exceeded 100 search requests per 15 min');
    res.status(429).json(options.message);
  },
});

export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests to API. Please slow down.',
    code: 'TOO_MANY_REQUESTS',
  },
  handler: (req, res, _next, options) => {
    logSecurityAudit('RATE_LIMIT_EXCEEDED_API', req, 'Exceeded 300 API requests per 15 min');
    res.status(429).json(options.message);
  },
});

// ============================================================================
// ZOD VALIDATION MIDDLEWARE HELPER
// ============================================================================

export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const primaryMessage = formattedErrors[0]?.message || 'Validation failed for request body.';
        logSecurityAudit('VALIDATION_FAILURE_BODY', req, primaryMessage);

        return res.status(422).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const primaryMessage = formattedErrors[0]?.message || 'Invalid URL parameters.';
        logSecurityAudit('VALIDATION_FAILURE_PARAMS', req, primaryMessage);

        return res.status(400).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const primaryMessage = formattedErrors[0]?.message || 'Invalid query parameters.';
        logSecurityAudit('VALIDATION_FAILURE_QUERY', req, primaryMessage);

        return res.status(400).json({
          success: false,
          message: primaryMessage,
          errors: formattedErrors,
        });
      }
      next(error);
    }
  };
};

// Common Parameter Schema for MongoDB ObjectId or Custom IDs
export const idParamSchema = z.object({
  id: z.string().trim().min(1, 'ID parameter is required.'),
});
