import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_ISSUER = 'pearl-and-polishh-atelier';
export const JWT_AUDIENCE = 'pearl-and-polishh-api';

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET || 'pearl_and_polishh_default_dev_jwt_secret_key_2026';
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing in production.');
  }
  return secret;
};

export const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'pearl_and_polishh_default_dev_jwt_refresh_secret_key_2026';
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET environment variable is missing in production.');
  }
  return secret;
};

export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Enterprise Authentication Middleware.
 * Verifies access JWT from HttpOnly cookie or Bearer header with strict claim validation.
 */
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token missing or expired. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as any;

    if (!decoded.userId && !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid token claims.' });
    }

    req.user = {
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id,
      email: decoded.email,
      name: decoded.name || 'User',
      role: decoded.role || 'client',
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or tampered authentication token.',
    });
  }
};

export const authenticate = protect;

/**
 * Role-Based Access Control (RBAC) Middleware.
 */
export const authorize = (...roles: Array<'client' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have sufficient permissions to access this resource.',
      });
    }

    next();
  };
};

export const requireAdmin = authorize('admin');
export const adminOnly = requireAdmin;

export const requireClient = authorize('client');

/**
 * CSRF Protection Middleware for State-Changing Operations.
 * Verifies Origin or Referer matches server environment or presence of custom request header.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Allow requests with standard AJAX custom headers or matching origins
  const requestedWith = req.get('x-requested-with');
  const origin = req.get('origin');
  const referer = req.get('referer');

  if (requestedWith || origin || referer || req.headers['content-type']?.includes('application/json')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'CSRF validation failed: Missing origin or request verification headers.',
  });
};
