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

const LOG_PREFIX = '[AuthController]';

export class AuthController {
  /**
   * POST /auth/login
   */
  async login(c: Context) {
    console.info(`${LOG_PREFIX} POST /auth/login`);
    
    const body = await c.req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Login validation failed`, { 
        errors: parsed.error.errors.map(e => e.message) 
      });
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

    console.info(`${LOG_PREFIX} Login response sent`, { userId: user._id.toString() });
    
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
    console.info(`${LOG_PREFIX} POST /auth/logout`, { userId: user.sub });
    
    await authService.logout(user.sub);

    console.info(`${LOG_PREFIX} Logout response sent`, { userId: user.sub });
    
    return c.json(successResponse({
      message: 'Successfully logged out',
    }), 200);
  }

  /**
   * POST /auth/refresh
   */
  async refresh(c: Context) {
    console.info(`${LOG_PREFIX} POST /auth/refresh`);
    
    const body = await c.req.json();
    const parsed = refreshTokenSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Refresh validation failed`);
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    const tokens = await authService.refreshAccessToken(parsed.data.refresh_token);

    console.info(`${LOG_PREFIX} Token refresh response sent`);
    
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
    console.info(`${LOG_PREFIX} POST /auth/forgot-password`);
    
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Forgot password validation failed`);
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

    console.info(`${LOG_PREFIX} Forgot password response sent`, { email: parsed.data.email });
    
    // Always return success to prevent email enumeration
    return c.json(successResponse({
      message: 'If an account exists with this email, a password reset link has been sent.',
    }), 200);
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(c: Context) {
    console.info(`${LOG_PREFIX} POST /auth/reset-password`);
    
    const body = await c.req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      console.warn(`${LOG_PREFIX} Reset password validation failed`);
      return c.json(
        errorResponse('VALIDATION_ERROR', 'Validation failed',
          parsed.error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
        ),
        422
      );
    }

    await authService.resetPassword(parsed.data.token, parsed.data.password);

    console.info(`${LOG_PREFIX} Reset password response sent`);
    
    return c.json(successResponse({
      message: 'Password has been reset successfully. Please login with your new password.',
    }), 200);
  }

  /**
   * GET /auth/me
   */
  async me(c: Context) {
    const jwtUser = c.get('user') as JwtPayload;
    console.info(`${LOG_PREFIX} GET /auth/me`, { userId: jwtUser.sub });
    
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

    console.info(`${LOG_PREFIX} Me response sent`, { userId: jwtUser.sub });
    
    return c.json(successResponse(response), 200);
  }
}

export const authController = new AuthController();
