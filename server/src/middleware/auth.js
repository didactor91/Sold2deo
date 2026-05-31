/**
 * JWT Authentication Middleware
 * @module server/src/middleware/auth
 */
import { jwtVerify, SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'weldmaster-secret-key-change-in-production'
);

const JWT_ISSUER = 'weldmaster-server';
const JWT_AUDIENCE = 'weldmaster-client';

/**
 * Create a JWT token for a user
 * @param {Object} payload - Token payload
 * @param {number} payload.userId
 * @param {string} payload.username
 * @returns {Promise<string>}
 */
export async function createToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Express middleware to require authentication
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  verifyToken(token).then((payload) => {
    if (!payload) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = {
      id: payload.userId,
      username: payload.username,
    };

    next();
  }).catch(() => {
    res.status(401).json({ error: 'Invalid or expired token' });
  });
}

/**
 * Optional auth middleware — attaches user if token present, but doesn't require it
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);

  verifyToken(token).then((payload) => {
    if (payload) {
      req.user = {
        id: payload.userId,
        username: payload.username,
      };
    }
    next();
  }).catch(() => {
    next();
  });
}
