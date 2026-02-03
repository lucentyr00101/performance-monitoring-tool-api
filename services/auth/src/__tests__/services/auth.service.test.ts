import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '@auth/services/auth.service.js';
import { User } from '@auth/models/user.model.js';
import { RefreshToken } from '@auth/models/refresh-token.model.js';
import bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('login', () => {
    const testEmail = 'test@example.com';
    const testPassword = 'Password123';

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash(testPassword, 4);
      await User.create({
        email: testEmail,
        passwordHash,
        role: 'employee',
        status: 'active',
      });
    });

    it('should login successfully with valid credentials', async () => {
      const result = await authService.login(testEmail, testPassword);

      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
      expect(result.tokens.expiresIn).toBe(3600);
      expect(result.user.email).toBe(testEmail);
    });

    it('should throw error for invalid email', async () => {
      await expect(authService.login('wrong@example.com', testPassword))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      await expect(authService.login(testEmail, 'wrongpassword'))
        .rejects
        .toThrow('Invalid email or password');
    });

    it('should increment failed login attempts on wrong password', async () => {
      await expect(authService.login(testEmail, 'wrongpassword')).rejects.toThrow();

      const user = await User.findOne({ email: testEmail });
      expect(user?.failedLoginAttempts).toBe(1);
    });

    it('should lock account after max failed attempts', async () => {
      for (let i = 0; i < 5; i++) {
        await expect(authService.login(testEmail, 'wrongpassword')).rejects.toThrow();
      }

      const user = await User.findOne({ email: testEmail });
      expect(user?.lockedUntil).toBeDefined();
      expect(user?.lockedUntil!.getTime()).toBeGreaterThan(Date.now());

      await expect(authService.login(testEmail, testPassword))
        .rejects
        .toThrow('Account is temporarily locked');
    });

    it('should reject suspended account', async () => {
      await User.updateOne({ email: testEmail }, { status: 'suspended' });

      await expect(authService.login(testEmail, testPassword))
        .rejects
        .toThrow('Account has been suspended');
    });

    it('should reset failed attempts on successful login', async () => {
      // First fail some attempts
      await expect(authService.login(testEmail, 'wrongpassword')).rejects.toThrow();
      await expect(authService.login(testEmail, 'wrongpassword')).rejects.toThrow();

      // Then succeed
      await authService.login(testEmail, testPassword);

      const user = await User.findOne({ email: testEmail });
      expect(user?.failedLoginAttempts).toBe(0);
    });

    it('should update lastLoginAt on successful login', async () => {
      const before = new Date();
      await authService.login(testEmail, testPassword);
      const after = new Date();

      const user = await User.findOne({ email: testEmail });
      expect(user?.lastLoginAt).toBeDefined();
      expect(user?.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user?.lastLoginAt!.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('refreshAccessToken', () => {
    let refreshToken: string;
    const testEmail = 'test@example.com';

    beforeEach(async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      await User.create({
        email: testEmail,
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      const result = await authService.login(testEmail, 'Password123');
      refreshToken = result.tokens.refreshToken;
    });

    it('should refresh tokens successfully', async () => {
      const newTokens = await authService.refreshAccessToken(refreshToken);

      expect(newTokens.accessToken).toBeDefined();
      expect(newTokens.refreshToken).toBeDefined();
      expect(newTokens.refreshToken).not.toBe(refreshToken);
    });

    it('should revoke old refresh token after refresh', async () => {
      await authService.refreshAccessToken(refreshToken);

      // Old token should now be invalid
      await expect(authService.refreshAccessToken(refreshToken))
        .rejects
        .toThrow('Invalid or expired refresh token');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshAccessToken('invalid-token'))
        .rejects
        .toThrow();
    });
  });

  describe('logout', () => {
    it('should revoke all refresh tokens for user', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      // Login twice to create multiple refresh tokens
      await authService.login('test@example.com', 'Password123');
      await authService.login('test@example.com', 'Password123');

      const tokensBefore = await RefreshToken.countDocuments({
        userId: user._id,
        revokedAt: null,
      });
      expect(tokensBefore).toBe(2);

      await authService.logout(user._id.toString());

      const tokensAfter = await RefreshToken.countDocuments({
        userId: user._id,
        revokedAt: null,
      });
      expect(tokensAfter).toBe(0);
    });
  });

  describe('forgotPassword', () => {
    it('should generate reset token for existing user', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      const resetToken = await authService.forgotPassword('test@example.com');

      expect(resetToken).toBeDefined();
      expect(typeof resetToken).toBe('string');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.passwordResetToken).toBeDefined();
      expect(user?.passwordResetExpires).toBeDefined();
      expect(user?.passwordResetExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for non-existing user', async () => {
      const resetToken = await authService.forgotPassword('nonexistent@example.com');
      expect(resetToken).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should reset password with valid token', async () => {
      const passwordHash = await bcrypt.hash('OldPassword123', 4);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      const resetToken = await authService.forgotPassword('test@example.com');
      await authService.resetPassword(resetToken!, 'NewPassword123');

      // Should be able to login with new password
      const result = await authService.login('test@example.com', 'NewPassword123');
      expect(result.tokens).toBeDefined();
    });

    it('should throw error for invalid token', async () => {
      await expect(authService.resetPassword('invalid-token', 'NewPassword123'))
        .rejects
        .toThrow('Invalid or expired reset token');
    });

    it('should clear reset token after successful reset', async () => {
      const passwordHash = await bcrypt.hash('OldPassword123', 4);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      const resetToken = await authService.forgotPassword('test@example.com');
      await authService.resetPassword(resetToken!, 'NewPassword123');

      const user = await User.findOne({ email: 'test@example.com' });
      expect(user?.passwordResetToken).toBeUndefined();
      expect(user?.passwordResetExpires).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await authService.createUser({
        email: 'new@example.com',
        password: 'Password123',
        role: 'employee',
      });

      expect(user.email).toBe('new@example.com');
      expect(user.role).toBe('employee');
      expect(user.status).toBe('active');
    });

    it('should hash the password', async () => {
      await authService.createUser({
        email: 'new@example.com',
        password: 'Password123',
      });

      const user = await User.findOne({ email: 'new@example.com' });
      expect(user?.passwordHash).not.toBe('Password123');
      expect(await bcrypt.compare('Password123', user!.passwordHash)).toBe(true);
    });

    it('should throw error for duplicate email', async () => {
      await authService.createUser({
        email: 'test@example.com',
        password: 'Password123',
      });

      await expect(authService.createUser({
        email: 'test@example.com',
        password: 'Password456',
      })).rejects.toThrow('User with this email already exists');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by ID', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const createdUser = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'manager',
        status: 'active',
      });

      const user = await authService.getCurrentUser(createdUser._id.toString());

      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('manager');
    });

    it('should throw error for non-existing user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      await expect(authService.getCurrentUser(fakeId))
        .rejects
        .toThrow('User not found');
    });
  });
});
