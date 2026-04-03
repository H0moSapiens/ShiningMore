import jwt from 'jsonwebtoken';
import { getCookie } from 'cookies-next';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserFromRequest(req, res) {
  const token = getCookie('auth_token', { req, res });
  if (!token) return null;
  return verifyToken(token);
}
