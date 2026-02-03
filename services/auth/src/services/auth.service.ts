import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import type { StringValue } from 'ms';
import { User, RefreshToken } from '@auth/models/index.js';
import type { UserDocument } from '@auth/models/index.js';
import { createError, type JwtPayload } from '@pmt/shared';

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
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw createError.authentication('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw createError.authentication('Account is temporarily locked. Please try again later.');
    }

    // Check if account is suspended
    if (user.status === 'suspended') {
      throw createError.authorization('Account has been suspended. Please contact HR.');
    }

    if (user.status === 'inactive') {
      throw createError.authorization('Account is inactive. Please contact HR.');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      // Increment failed attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockedUntil = new Date(Date.now() + LOCK_TIME);
      }

      await user.save();
      throw createError.authentication('Invalid email or password');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return { tokens, user };
  }

  /**
   * Generate access and refresh tokens
   */
  async generateTokens(user: UserDocument): Promise<TokenPair> {
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
    let decoded: { sub: string };

    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as { sub: string };
    } catch {
      throw createError.authentication('Invalid or expired refresh token');
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const storedToken = await RefreshToken.findOne({
      userId: decoded.sub,
      tokenHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!storedToken) {
      throw createError.authentication('Invalid or expired refresh token');
    }

    // Revoke old token
    storedToken.revokedAt = new Date();
    await storedToken.save();

    const user = await User.findById(decoded.sub);

    if (!user || user.status !== 'active') {
      throw createError.authentication('User not found or inactive');
    }

    // Generate new tokens
    return this.generateTokens(user);
  }

  /**
   * Logout user - revoke refresh token
   */
  async logout(userId: string): Promise<void> {
    await RefreshToken.updateMany(
      { userId, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<string | null> {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return null but don't throw - prevents email enumeration
      return null;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return resetToken;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      throw createError.validation('Invalid or expired reset token');
    }

    // Hash new password
    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    // Revoke all refresh tokens
    await RefreshToken.updateMany(
      { userId: user._id, revokedAt: null },
      { revokedAt: new Date() }
    );
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<UserDocument> {
    const user = await User.findById(userId);

    if (!user) {
      throw createError.notFound('User');
    }

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
    const existingUser = await User.findOne({ email: data.email.toLowerCase() });

    if (existingUser) {
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

    return user;
  }
}

export const authService = new AuthService();
