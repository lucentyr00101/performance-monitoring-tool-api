import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import { User, RefreshToken } from '@auth/models/index.js';
import type { UserDocument } from '@auth/models/index.js';
import { createError, type JwtPayload } from '@pmt/shared';

const LOG_PREFIX = '[AuthService]';
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const JWT_ACCESS_EXPIRY = (process.env.JWT_ACCESS_EXPIRY || '1h') as StringValue;
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as StringValue;
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface LoginResult {
  tokens: TokenPair;
  user: UserDocument;
}

export class AuthService {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<LoginResult> {
    console.info(`${LOG_PREFIX} Login attempt`, { email });
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.warn(`${LOG_PREFIX} Login failed - user not found`, { email });
      throw createError.invalidCredentials();
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.warn(`${LOG_PREFIX} Login failed - account locked`, { email, lockedUntil: user.lockedUntil });
      throw createError.accountLocked();
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      console.warn(`${LOG_PREFIX} Login failed - account suspended`, { email, userId: user._id.toString() });
      throw createError.accountSuspended();
    }

    if (user.status === 'inactive') {
      console.warn(`${LOG_PREFIX} Login failed - account inactive`, { email, userId: user._id.toString() });
      throw createError.authentication('Account is inactive. Please contact HR.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      console.warn(`${LOG_PREFIX} Login failed - invalid password`, { 
        email, 
        userId: user._id.toString(), 
        failedAttempts: user.failedLoginAttempts 
      });

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_TIME);
        console.warn(`${LOG_PREFIX} Account locked due to failed attempts`, { 
          email, 
          userId: user._id.toString(), 
          lockedUntil: user.lockedUntil 
        });
      }

      await user.save();
      throw createError.invalidCredentials();
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    console.info(`${LOG_PREFIX} Login successful`, { 
      userId: user._id.toString(), 
      email, 
      role: user.role 
    });
    
    return { tokens, user };
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: UserDocument): Promise<TokenPair> {
    console.info(`${LOG_PREFIX} Generating tokens`, { userId: user._id.toString() });
    
    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      employeeId: user.employeeId?.toString(),
    };

    const accessOptions: SignOptions = { expiresIn: JWT_ACCESS_EXPIRY };
    const refreshOptions: SignOptions = { expiresIn: JWT_REFRESH_EXPIRY };

    const accessToken = jwt.sign(payload, JWT_SECRET, accessOptions);
    // Add jti (JWT ID) to ensure each refresh token is unique
    const jti = crypto.randomBytes(16).toString('hex');
    const refreshToken = jwt.sign({ sub: user._id.toString(), jti }, JWT_SECRET, refreshOptions);

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    console.info(`${LOG_PREFIX} Tokens generated successfully`, { 
      userId: user._id.toString(), 
      expiresIn: 3600 
    });
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour in seconds
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<TokenPair> {
    console.info(`${LOG_PREFIX} Refreshing access token`);
    
    let decoded: { sub: string };

    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as { sub: string };
    } catch (error) {
      console.warn(`${LOG_PREFIX} Token refresh failed - invalid token`);
      throw createError.tokenInvalid('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await RefreshToken.findOne({
      userId: decoded.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      console.warn(`${LOG_PREFIX} Token refresh failed - token not found or expired`, { userId: decoded.sub });
      throw createError.tokenExpired('Refresh token has expired. Please login again.');
    }

    // Revoke old token
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await User.findById(decoded.sub);

    if (!user || user.status !== 'active') {
      console.warn(`${LOG_PREFIX} Token refresh failed - user not found or inactive`, { userId: decoded.sub });
      throw createError.authentication('User account not found or inactive');
    }

    console.info(`${LOG_PREFIX} Token refresh successful`, { userId: decoded.sub });
    
    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout user - revoke refresh token
   */
  async logout(userId: string): Promise<void> {
    console.info(`${LOG_PREFIX} Logging out user`, { userId });
    
    const result = await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
    
    console.info(`${LOG_PREFIX} Logout successful`, { userId, tokensRevoked: result.modifiedCount });
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<string | null> {
    console.info(`${LOG_PREFIX} Password reset requested`, { email });
    
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.info(`${LOG_PREFIX} Password reset - user not found (silent)`, { email });
      // Return null but don't throw - prevents email enumeration
      return null;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    console.info(`${LOG_PREFIX} Password reset token generated`, { 
      userId: user._id.toString(), 
      email, 
      expiresAt: user.passwordResetExpires 
    });
    
    return resetToken;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    console.info(`${LOG_PREFIX} Password reset attempt`);
    
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      console.warn(`${LOG_PREFIX} Password reset failed - invalid or expired token`);
      throw createError.tokenExpired('Password reset link has expired. Please request a new one.');
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    // Revoke all refresh tokens
    const result = await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );

    console.info(`${LOG_PREFIX} Password reset successful`, { 
      userId: user._id.toString(), 
      tokensRevoked: result.modifiedCount 
    });
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<UserDocument> {
    console.info(`${LOG_PREFIX} Getting current user`, { userId });
    
    const user = await User.findById(userId);

    if (!user) {
      console.warn(`${LOG_PREFIX} User not found`, { userId });
      throw createError.resourceNotFound('User', userId);
    }

    console.info(`${LOG_PREFIX} User retrieved`, { userId, email: user.email, role: user.role });
    
    return user;
  }

  /**
   * Create a new user (used internally)
   */
  async createUser(data: {
    email: string;
    password: string;
    role?: string;
    employeeId?: string;
  }): Promise<UserDocument> {
    console.info(`${LOG_PREFIX} Creating user`, { email: data.email, role: data.role || 'employee' });
    
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });

    if (existingUser) {
      console.warn(`${LOG_PREFIX} User creation failed - email exists`, { email: data.email });
      throw createError.conflict('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    const user = await User.create({
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'employee',
      status: 'active',
      employeeId: data.employeeId,
    });

    console.info(`${LOG_PREFIX} User created successfully`, { 
      userId: user._id.toString(), 
      email: user.email, 
      role: user.role 
    });
    
    return user;
  }
}

export const authService = new AuthService();
