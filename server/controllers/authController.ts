import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import { Store } from '../services/store';
import {
  AuthRequest,
  getJwtSecret,
  getJwtRefreshSecret,
  JWT_ISSUER,
  JWT_AUDIENCE,
} from '../middleware/authMiddleware';

// --- CONSTANTS & CONFIGURATION ---
const DUMMY_HASH = '$2a$12$e8vE81r8f3bKq1c1C1C1C.dummyHashForTimingSafety1234567';
const MAX_FAILED_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

const getGoogleClientId = (): string | null => {
  return process.env.GOOGLE_CLIENT_ID || null;
};

// --- AUDIT LOGGING ---
export const logAuthAudit = (
  event: string,
  email: string,
  req: Request,
  details?: string
) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';
  console.log(
    `[AUTH AUDIT] ${timestamp} | Event: ${event} | Email: ${email} | IP: ${ip} | UA: ${userAgent}${
      details ? ` | Details: ${details}` : ''
    }`
  );
};

// --- REGISTRATION RATE LIMITING ---
const registrationAttemptsMap = new Map<string, { count: number; resetAt: number }>();
const REGISTRATION_LIMIT = 5; // Max 5 registrations per hour per IP
const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;

const checkRegistrationRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const record = registrationAttemptsMap.get(ip);
  if (!record || now > record.resetAt) {
    registrationAttemptsMap.set(ip, { count: 1, resetAt: now + REGISTRATION_WINDOW_MS });
    return true;
  }
  if (record.count >= REGISTRATION_LIMIT) {
    return false;
  }
  record.count += 1;
  return true;
};

// --- ZOD SCHEMAS ---
const passwordRules = z
  .string()
  .min(8, 'Password must be at least 8 characters long.')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must contain at least one number.')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character.');

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters long.'),
    email: z.string().trim().toLowerCase().email('Please provide a valid email address.'),
    password: passwordRules,
    confirmPassword: z.string().optional(),
    phone: z.string().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
  requestedPortal: z.enum(['admin', 'client']).optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.'),
});

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Password reset token is required.'),
    newPassword: passwordRules,
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

// --- REFRESH TOKEN HASH HELPER ---
const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// --- SECURE COOKIE OPTIONS HELPER ---
const getCookieBaseOptions = () => {
  const isProd = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  };
};

// --- TOKEN ISSUANCE & COOKIE SETTING ---
const sendTokenResponse = async (
  user: any,
  statusCode: number,
  res: Response,
  req: Request
) => {
  const userId = user.id || user._id;
  const cleanEmail = user.email.trim().toLowerCase();

  // 1. Generate Access Token (15 minute expiration)
  const accessToken = jwt.sign(
    {
      userId,
      id: userId,
      email: cleanEmail,
      name: user.name,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: '15m',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: 'HS256',
    }
  );

  // 2. Generate Refresh Token (7 day expiration)
  const rawRefreshToken = jwt.sign(
    {
      userId,
      id: userId,
      email: cleanEmail,
      jti: crypto.randomBytes(16).toString('hex'), // Unique token identifier
    },
    getJwtRefreshSecret(),
    {
      expiresIn: '7d',
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithm: 'HS256',
    }
  );

  // 3. Hash Refresh Token & Store in DB
  const refreshTokenHash = hashToken(rawRefreshToken);
  const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const existingTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
  // Retain active, unexpired tokens (max 10 devices/sessions)
  const activeTokens = existingTokens
    .filter((t: any) => new Date(t.expiresAt) > new Date())
    .slice(-9);

  activeTokens.push({
    tokenHash: refreshTokenHash,
    expiresAt: refreshTokenExpiresAt,
    createdAt: new Date(),
    userAgent: req.get('user-agent') || 'unknown',
    ip: req.ip || req.socket.remoteAddress || 'unknown',
  });

  await Store.updateUser(userId, { refreshTokens: activeTokens });

  // 4. Set HttpOnly Cookies
  const cookieOptions = getCookieBaseOptions();

  res.cookie('token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refreshToken', rawRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  // 5. Return JSON User Object (JWTs are NEVER exposed in JSON response body)
  res.status(statusCode).json({
    success: true,
    user: {
      id: userId,
      name: user.name,
      email: cleanEmail,
      role: user.role,
      phone: user.phone || '',
      avatar: user.avatar || '',
      isVerified: user.isVerified !== false,
    },
  });
};

// ============================================================================
// CONTROLLER HANDLERS
// ============================================================================

/**
 * Register User
 * Enforces Zod schema, password policy, bcrypt 12 rounds, default 'client' role.
 */
export const register = async (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (!checkRegistrationRateLimit(clientIp)) {
    logAuthAudit('REGISTER_RATE_LIMITED', 'unknown', req, 'Exceeded hourly registration limit');
    return res.status(429).json({
      success: false,
      message: 'Too many registration requests from this IP. Please try again later.',
    });
  }

  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues[0]?.message || 'Invalid registration input.';
    logAuthAudit('REGISTER_FAILURE_VALIDATION', req.body.email || 'unknown', req, errorMessage);
    return res.status(400).json({ success: false, message: errorMessage });
  }

  const { name, email, password, phone } = parseResult.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const existingUser = await Store.findUserByEmail(cleanEmail);
    if (existingUser) {
      logAuthAudit('REGISTER_FAILURE_EXISTS', cleanEmail, req, 'Email already registered');
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user (Role is strictly 'client' regardless of frontend inputs)
    const newUser = await Store.createUser({
      name,
      email: cleanEmail,
      passwordHash,
      role: 'client',
      phone: phone || '',
      isVerified: false,
    });

    logAuthAudit('REGISTER_SUCCESS', cleanEmail, req);
    await sendTokenResponse(newUser, 201, res, req);
  } catch (error: any) {
    logAuthAudit('REGISTER_ERROR', cleanEmail, req, error.message);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

/**
 * Login User
 * Implements timing-safe authentication, account lockout, generic errors, audit logging.
 */
export const login = async (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues[0]?.message || 'Invalid email or password.';
    return res.status(400).json({ success: false, message: errorMessage });
  }

  const { email, password, requestedPortal } = parseResult.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await Store.findUserByEmail(cleanEmail);

    // Check Account Lockout
    if (user && user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockUntil).getTime() - Date.now()) / 60000
      );
      logAuthAudit('LOGIN_BLOCKED_LOCKOUT', cleanEmail, req, `Locked for ${remainingMinutes} min`);
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked due to repeated failed login attempts. Please try again in ${remainingMinutes} minutes.`,
      });
    }

    // Timing-Safe Authentication (Perform bcrypt.compare even if user or passwordHash is absent)
    const targetHash = user?.passwordHash || DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, targetHash);

    if (!user || !user.passwordHash || !isPasswordValid) {
      if (user) {
        const failedCount = (user.failedLoginAttempts || 0) + 1;
        const updateFields: any = { failedLoginAttempts: failedCount };

        if (failedCount >= MAX_FAILED_LOGIN_ATTEMPTS) {
          updateFields.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
          logAuthAudit('ACCOUNT_LOCKED', cleanEmail, req, `Exceeded ${MAX_FAILED_LOGIN_ATTEMPTS} attempts`);
        }

        await Store.updateUser(user.id || user._id, updateFields);
      }

      logAuthAudit('LOGIN_FAILURE_INVALID_CREDENTIALS', cleanEmail, req);
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check Portal Authorization
    if (requestedPortal === 'admin' && user.role !== 'admin') {
      logAuthAudit('LOGIN_FAILURE_UNAUTHORIZED_PORTAL', cleanEmail, req, 'Requested admin portal without admin role');
      return res.status(403).json({
        success: false,
        message: 'Access Denied: This account does not have admin permissions.',
      });
    }

    // Successful Login: Clear failed attempts and lockouts
    await Store.updateUser(user.id || user._id, {
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    logAuthAudit('LOGIN_SUCCESS', cleanEmail, req, `Portal: ${requestedPortal || 'standard'}`);
    await sendTokenResponse(user, 200, res, req);
  } catch (error: any) {
    logAuthAudit('LOGIN_ERROR', cleanEmail, req, error.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

/**
 * Google Sign-In
 * Strictly verifies Google ID token via OAuth2Client.verifyIdToken().
 * Rejects unverified tokens, missing issuer, missing audience.
 */
export const googleAuth = async (req: Request, res: Response) => {
  const googleClientId = getGoogleClientId();
  if (!googleClientId) {
    logAuthAudit('GOOGLE_AUTH_FAILURE', 'unknown', req, 'GOOGLE_CLIENT_ID not configured on server');
    return res.status(500).json({
      success: false,
      message: 'Google authentication is not configured on this server.',
    });
  }

  const { credential } = req.body;
  if (!credential || typeof credential !== 'string') {
    logAuthAudit('GOOGLE_AUTH_FAILURE', 'unknown', req, 'Missing Google ID token credential');
    return res.status(400).json({ success: false, message: 'Google credential token is required.' });
  }

  try {
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      logAuthAudit('GOOGLE_AUTH_FAILURE', 'unknown', req, 'Google token payload missing email');
      return res.status(401).json({ success: false, message: 'Invalid or unverified Google token.' });
    }

    // Validate Issuer and Expiration
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      logAuthAudit('GOOGLE_AUTH_FAILURE', payload.email, req, 'Invalid token issuer');
      return res.status(401).json({ success: false, message: 'Google token issuer verification failed.' });
    }

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      logAuthAudit('GOOGLE_AUTH_FAILURE', payload.email, req, 'Google token expired');
      return res.status(401).json({ success: false, message: 'Google token has expired.' });
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const googleName = payload.name || payload.given_name || 'Google User';
    const googleSub = payload.sub;
    const googlePicture = payload.picture || '';

    let user = await Store.findUserByEmail(cleanEmail);

    if (!user) {
      user = await Store.createUser({
        name: googleName,
        email: cleanEmail,
        googleId: googleSub,
        avatar: googlePicture,
        role: 'client',
        isVerified: true,
      });
      logAuthAudit('GOOGLE_REGISTER_SUCCESS', cleanEmail, req);
    } else {
      await Store.updateUser(user.id || user._id, {
        googleId: user.googleId || googleSub,
        avatar: user.avatar || googlePicture,
        isVerified: true,
        lastLoginAt: new Date(),
      });
      logAuthAudit('GOOGLE_LOGIN_SUCCESS', cleanEmail, req);
    }

    await sendTokenResponse(user, 200, res, req);
  } catch (error: any) {
    logAuthAudit('GOOGLE_AUTH_ERROR', 'unknown', req, error.message);
    res.status(401).json({
      success: false,
      message: 'Google authentication token verification failed.',
    });
  }
};

/**
 * Dedicated Admin Google Sign-In Endpoint
 * POST /api/auth/admin/google
 *
 * 1. Verifies Google ID Token server-side via OAuth2Client.verifyIdToken().
 * 2. Extracts verified email from payload (never trusting email from frontend).
 * 3. Enforces Admin Access Control whitelist from ADMIN_GOOGLE_EMAILS env var.
 * 4. Automatically creates or updates admin user in store.
 * 5. Generates secure JWT access token & HttpOnly cookies.
 */
export const adminGoogleAuth = async (req: Request, res: Response) => {
  const googleClientId = getGoogleClientId();
  if (!googleClientId) {
    logAuthAudit('ADMIN_GOOGLE_AUTH_FAILURE', 'unknown', req, 'GOOGLE_CLIENT_ID not configured on server');
    return res.status(500).json({
      success: false,
      message: 'Google authentication is not configured on this server.',
    });
  }

  const { credential } = req.body;
  if (!credential || typeof credential !== 'string') {
    logAuthAudit('ADMIN_GOOGLE_AUTH_FAILURE', 'unknown', req, 'Missing Google ID token credential');
    return res.status(400).json({ success: false, message: 'Google credential token is required.' });
  }

  try {
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      logAuthAudit('ADMIN_GOOGLE_AUTH_FAILURE', 'unknown', req, 'Google token payload missing email');
      return res.status(401).json({ success: false, message: 'Invalid or unverified Google token.' });
    }

    // Validate Issuer and Expiration
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!payload.iss || !validIssuers.includes(payload.iss)) {
      logAuthAudit('ADMIN_GOOGLE_AUTH_FAILURE', payload.email, req, 'Invalid token issuer');
      return res.status(401).json({ success: false, message: 'Google token issuer verification failed.' });
    }

    if (payload.exp && payload.exp * 1000 <= Date.now()) {
      logAuthAudit('ADMIN_GOOGLE_AUTH_FAILURE', payload.email, req, 'Google token expired');
      return res.status(401).json({ success: false, message: 'Google token has expired.' });
    }

    const cleanEmail = payload.email.trim().toLowerCase();
    const googleName = payload.name || payload.given_name || 'Admin User';
    const googleSub = payload.sub;
    const googlePicture = payload.picture || '';

    // Environment Variable Whitelist Enforcement
    const rawAdminEmails =
      process.env.ADMIN_GOOGLE_EMAILS ||
      'tanaynagpal5@gmail.com,maanvinagpal18@gmail.com,maanvinagpal1@gmail.com';
    const allowedAdminEmails = new Set(
      rawAdminEmails
        .split(',')
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean)
    );

    if (!allowedAdminEmails.has(cleanEmail)) {
      logAuthAudit(
        'UNAUTHORIZED_ADMIN_GOOGLE_LOGIN_ATTEMPT',
        cleanEmail,
        req,
        'Email not authorized in ADMIN_GOOGLE_EMAILS whitelist'
      );
      return res.status(403).json({
        success: false,
        message: `Access Denied: The Google account (${cleanEmail}) is not authorized for Admin Portal access.`,
      });
    }

    // Find or Create Admin User
    let adminUser = await Store.findUserByEmail(cleanEmail);

    if (!adminUser) {
      adminUser = await Store.createUser({
        name: googleName,
        email: cleanEmail,
        googleId: googleSub,
        avatar: googlePicture,
        role: 'admin',
        isVerified: true,
      });
      logAuthAudit('ADMIN_GOOGLE_REGISTER_SUCCESS', cleanEmail, req);
    } else {
      await Store.updateUser(adminUser.id || adminUser._id, {
        role: 'admin',
        googleId: googleSub,
        avatar: adminUser.avatar || googlePicture,
        isVerified: true,
        lastLoginAt: new Date(),
      });
      adminUser.role = 'admin';
      logAuthAudit('ADMIN_GOOGLE_LOGIN_SUCCESS', cleanEmail, req);
    }

    await sendTokenResponse(adminUser, 200, res, req);
  } catch (error: any) {
    logAuthAudit('ADMIN_GOOGLE_AUTH_ERROR', 'unknown', req, error.message);
    res.status(401).json({
      success: false,
      message: 'Google authentication token verification failed.',
    });
  }
};

/**
 * Refresh Access Token with Token Rotation & Reuse Detection.
 */
export const refreshToken = async (req: Request, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;

  if (!rawRefreshToken) {
    logAuthAudit('REFRESH_TOKEN_FAILURE', 'unknown', req, 'Missing refreshToken cookie');
    return res.status(401).json({ success: false, message: 'Refresh token cookie missing.' });
  }

  try {
    const decoded = jwt.verify(rawRefreshToken, getJwtRefreshSecret(), {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    }) as any;

    const userId = decoded.userId || decoded.id;
    const user = await Store.findUserById(userId);

    if (!user) {
      logAuthAudit('REFRESH_TOKEN_FAILURE', decoded.email || 'unknown', req, 'User not found');
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    const incomingHash = hashToken(rawRefreshToken);
    const existingTokens = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];

    const tokenIndex = existingTokens.findIndex(
      (t: any) => t.tokenHash === incomingHash && new Date(t.expiresAt) > new Date()
    );

    // REUSE DETECTION: Token is validly signed, but not in user's active list!
    if (tokenIndex === -1) {
      logAuthAudit(
        'REFRESH_TOKEN_REUSE_DETECTED',
        user.email,
        req,
        'SECURITY ALERT: Potential refresh token theft! Revoking all sessions.'
      );

      // Invalidate all sessions for this user immediately
      await Store.updateUser(userId, { refreshTokens: [] });

      const cookieOptions = getCookieBaseOptions();
      res.clearCookie('token', cookieOptions);
      res.clearCookie('refreshToken', cookieOptions);

      return res.status(401).json({
        success: false,
        message: 'Security alert: Refresh token already used or revoked. Please log in again.',
      });
    }

    // Remove consumed token
    existingTokens.splice(tokenIndex, 1);
    await Store.updateUser(userId, { refreshTokens: existingTokens });

    logAuthAudit('REFRESH_TOKEN_SUCCESS', user.email, req);
    await sendTokenResponse(user, 200, res, req);
  } catch (error: any) {
    logAuthAudit('REFRESH_TOKEN_ERROR', 'unknown', req, error.message);
    const cookieOptions = getCookieBaseOptions();
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);
    res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};

/**
 * Get Profile of Currently Authenticated User.
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const user = await Store.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user.id || user._id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        isVerified: user.isVerified !== false,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to retrieve user profile.' });
  }
};

/**
 * Logout Current Session
 */
export const logout = async (req: AuthRequest, res: Response) => {
  const rawRefreshToken = req.cookies?.refreshToken;
  const cookieOptions = getCookieBaseOptions();

  if (rawRefreshToken) {
    try {
      const incomingHash = hashToken(rawRefreshToken);
      if (req.user?.id) {
        const user = await Store.findUserById(req.user.id);
        if (user && Array.isArray(user.refreshTokens)) {
          const updatedTokens = user.refreshTokens.filter((t: any) => t.tokenHash !== incomingHash);
          await Store.updateUser(req.user.id, { refreshTokens: updatedTokens });
        }
      }
    } catch (e) {
      // Ignore token decode failures during logout
    }
  }

  res.clearCookie('token', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);

  logAuthAudit('LOGOUT_SUCCESS', req.user?.email || 'unknown', req);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * Logout All Devices / Revoke All Sessions
 */
export const logoutAll = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  try {
    await Store.updateUser(req.user.id, { refreshTokens: [] });

    const cookieOptions = getCookieBaseOptions();
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refreshToken', cookieOptions);

    logAuthAudit('LOGOUT_ALL_SUCCESS', req.user.email, req);
    res.status(200).json({ success: true, message: 'Logged out from all devices successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to revoke sessions.' });
  }
};

/**
 * Forgot Password - Generates crypto token, returns generic success response.
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const parseResult = forgotPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  const { email } = parseResult.data;
  const cleanEmail = email.trim().toLowerCase();

  try {
    const user = await Store.findUserByEmail(cleanEmail);
    if (user) {
      const rawResetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = hashToken(rawResetToken);
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      await Store.updateUser(user.id || user._id, {
        resetPasswordTokenHash: resetTokenHash,
        resetPasswordExpires: resetExpires,
      });

      logAuthAudit(
        'FORGOT_PASSWORD_REQUEST',
        cleanEmail,
        req,
        `Reset Token Generated: ${rawResetToken}`
      );
    } else {
      logAuthAudit('FORGOT_PASSWORD_NONEXISTENT', cleanEmail, req);
    }

    // Generic response to prevent account enumeration
    res.status(200).json({
      success: true,
      message: 'If an account with that email address exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    logAuthAudit('FORGOT_PASSWORD_ERROR', cleanEmail, req, error.message);
    res.status(500).json({ success: false, message: 'Server error processing password reset.' });
  }
};

/**
 * Reset Password with One-Time Token & Token Invalidation
 */
export const resetPassword = async (req: Request, res: Response) => {
  const parseResult = resetPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessage = parseResult.error.issues[0]?.message || 'Invalid password reset input.';
    return res.status(400).json({ success: false, message: errorMessage });
  }

  const { token, newPassword } = parseResult.data;
  const incomingHash = hashToken(token);

  try {
    const users = await Store.getAllUsers();
    const user = users.find(
      (u: any) =>
        u.resetPasswordTokenHash === incomingHash &&
        u.resetPasswordExpires &&
        new Date(u.resetPasswordExpires) > new Date()
    );

    if (!user) {
      logAuthAudit('RESET_PASSWORD_FAILURE', 'unknown', req, 'Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await Store.updateUser(user.id || user._id, {
      passwordHash,
      resetPasswordTokenHash: null,
      resetPasswordExpires: null,
      refreshTokens: [], // Revoke all existing sessions on password change
    });

    logAuthAudit('RESET_PASSWORD_SUCCESS', user.email, req);
    res.status(200).json({
      success: true,
      message: 'Password has been successfully reset. Please log in with your new password.',
    });
  } catch (error: any) {
    logAuthAudit('RESET_PASSWORD_ERROR', 'unknown', req, error.message);
    res.status(500).json({ success: false, message: 'Server error resetting password.' });
  }
};

/**
 * Email Verification Endpoint
 */
export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ success: false, message: 'Verification token is required.' });
  }

  const incomingHash = hashToken(token);

  try {
    const users = await Store.getAllUsers();
    const user = users.find(
      (u: any) =>
        u.emailVerificationTokenHash === incomingHash &&
        u.emailVerificationExpires &&
        new Date(u.emailVerificationExpires) > new Date()
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Email verification token is invalid or has expired.',
      });
    }

    await Store.updateUser(user.id || user._id, {
      isVerified: true,
      emailVerificationTokenHash: null,
      emailVerificationExpires: null,
    });

    logAuthAudit('EMAIL_VERIFIED_SUCCESS', user.email, req);
    res.status(200).json({ success: true, message: 'Email address successfully verified.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server error verifying email address.' });
  }
};
