import type { Context } from 'hono';
import { setCookie, deleteCookie } from 'hono/cookie';

const REFRESH_TOKEN_COOKIE = 'pmt_refresh_token';
const COOKIE_PATH = '/api/v1/auth';
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Set refresh token as an httpOnly cookie on the response.
 */
export function setRefreshTokenCookie(c: Context, refreshToken: string): void {
  const isProduction = process.env.NODE_ENV === 'production';

  setCookie(c, REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'Strict',
    path: COOKIE_PATH,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/**
 * Clear the refresh token cookie from the response.
 */
export function clearRefreshTokenCookie(c: Context): void {
  deleteCookie(c, REFRESH_TOKEN_COOKIE, {
    path: COOKIE_PATH,
  });
}

/**
 * Extract refresh token from cookie header.
 * Returns the token string or null if not present.
 */
export function getRefreshTokenFromCookie(c: Context): string | null {
  const cookieHeader = c.req.header('cookie');
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${REFRESH_TOKEN_COOKIE}=`));

  return match ? match.substring(REFRESH_TOKEN_COOKIE.length + 1) : null;
}
