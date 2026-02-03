import { Context } from 'hono';
import { authService, emailService } from '@auth/services/index.js';
import { 
  successResponse, 
  errorResponse,
  type JwtPayload,
} from '@pmt/shared';
import {
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@pmt/shared';

export class AuthController {
  /**
   * POST /auth/login
   */
  async login(c: Context) {
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed', 
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const { email, password } = parsed.data;
    const { tokens, user } = await authService.login(email, password);

    // Fetch employee data if available (would need to call employee service)
    const userData = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      employee: user.employeeId ? {
        id: user.employeeId.toString(),
        // Note: Full employee data would come from employee service
      } : null,
    };

    return c.json(successResponse({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: tokens.expiresIn,
      user: userData,
    }), 200);
  }

  /**
   * POST /auth/logout
   */
  async logout(c: Context) {
    const user = c.get('user') as JwtPayload;
    await authService.logout(user.sub);

    return c.json(successResponse({
      message: 'Successfully logged out',
    }), 200);
  }

  /**
   * POST /auth/refresh
   */
  async refresh(c: Context) {
    const body = await c.req.json();
    const parsed = refreshTokenSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const tokens = await authService.refreshAccessToken(parsed.data.refresh_token);

    return c.json(successResponse({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      token_type: 'Bearer',
      expires_in: tokens.expiresIn,
    }), 200);
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(c: Context) {
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const resetToken = await authService.forgotPassword(parsed.data.email);

    // Send email if user exists (don't reveal if user exists)
    if (resetToken) {
      await emailService.sendPasswordResetEmail(parsed.data.email, resetToken);
    }

    // Always return success to prevent email enumeration
    return c.json(successResponse({
      message: 'If an account exists with this email, a password reset link has been sent.',
    }), 200);
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(c: Context) {
    const body = await c.req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    await authService.resetPassword(parsed.data.token, parsed.data.password);

    return c.json(successResponse({
      message: 'Password has been reset successfully. Please login with your new password.',
    }), 200);
  }

  /**
   * GET /auth/me
   */
  async me(c: Context) {
    const jwtUser = c.get('user') as JwtPayload;
    const user = await authService.getCurrentUser(jwtUser.sub);

    // Build response (employee data would come from employee service)
    const response = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
      last_login_at: user.lastLoginAt?.toISOString() || null,
      employee: user.employeeId ? {
        id: user.employeeId.toString(),
        // Full employee data would be fetched from employee service
      } : null,
    };

    return c.json(successResponse(response), 200);
  }
}

export const authController = new AuthController();
