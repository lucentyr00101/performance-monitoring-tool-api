import { describe, it, expect, beforeEach } from 'vitest';
import { User } from '@auth/models/user.model.js';
import { RefreshToken } from '@auth/models/refresh-token.model.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

describe('User Model', () => {
  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('Password123', 4),
        role: 'employee' as const,
        status: 'active' as const,
      };

      const user = await User.create(userData);

      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('employee');
      expect(user.status).toBe('active');
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should require email', async () => {
      const userData = {
        passwordHash: 'somehash',
        role: 'employee',
        status: 'active',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should require valid email format', async () => {
      const userData = {
        email: 'invalid-email',
        passwordHash: 'somehash',
        role: 'employee',
        status: 'active',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should enforce unique email', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      });

      await expect(User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'active',
      })).rejects.toThrow();
    });

    it('should only allow valid roles', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const userData = {
        email: 'test@example.com',
        passwordHash,
        role: 'invalid_role',
        status: 'active',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should only allow valid statuses', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const userData = {
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        status: 'invalid_status',
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it('should default status to active', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
      });

      expect(user.status).toBe('active');
    });

    it('should default failedLoginAttempts to 0', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
      });

      expect(user.failedLoginAttempts).toBe(0);
    });
  });

  describe('Indexes', () => {
    it('should have index on email', async () => {
      const indexes = await User.collection.getIndexes();
      expect(indexes['email_1']).toBeDefined();
    });
  });

  describe('Employee Reference', () => {
    it('should accept valid ObjectId for employeeId', async () => {
      const passwordHash = await bcrypt.hash('Password123', 4);
      const employeeId = new mongoose.Types.ObjectId();
      
      const user = await User.create({
        email: 'test@example.com',
        passwordHash,
        role: 'employee',
        employeeId,
      });

      expect(user.employeeId?.toString()).toBe(employeeId.toString());
    });
  });
});

describe('RefreshToken Model', () => {
  let userId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('Password123', 4);
    const user = await User.create({
      email: 'test@example.com',
      passwordHash,
      role: 'employee',
    });
    userId = user._id as mongoose.Types.ObjectId;
  });

  describe('Schema Validation', () => {
    it('should create a refresh token with valid data', async () => {
      const token = await RefreshToken.create({
        userId,
        tokenHash: 'valid-refresh-token-hash',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(token.userId.toString()).toBe(userId.toString());
      expect(token.tokenHash).toBe('valid-refresh-token-hash');
      expect(token.revokedAt).toBeUndefined();
    });

    it('should require userId', async () => {
      await expect(RefreshToken.create({
        tokenHash: 'valid-refresh-token-hash',
        expiresAt: new Date(),
      })).rejects.toThrow();
    });

    it('should require tokenHash', async () => {
      await expect(RefreshToken.create({
        userId,
        expiresAt: new Date(),
      })).rejects.toThrow();
    });

    it('should require expiresAt', async () => {
      await expect(RefreshToken.create({
        userId,
        tokenHash: 'valid-refresh-token-hash',
      })).rejects.toThrow();
    });

    it('should default revokedAt to undefined', async () => {
      const token = await RefreshToken.create({
        userId,
        tokenHash: 'valid-refresh-token-hash',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      expect(token.revokedAt).toBeUndefined();
    });
  });

  describe('Token Management', () => {
    it('should be able to revoke a token', async () => {
      const token = await RefreshToken.create({
        userId,
        tokenHash: 'valid-refresh-token-hash',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      token.revokedAt = new Date();
      await token.save();

      const updated = await RefreshToken.findById(token._id);
      expect(updated?.revokedAt).toBeDefined();
    });

    it('should find valid (non-revoked) tokens', async () => {
      await RefreshToken.create({
        userId,
        tokenHash: 'token-hash-1',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await RefreshToken.create({
        userId,
        tokenHash: 'token-hash-2',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: new Date(),
      });

      const validTokens = await RefreshToken.find({
        userId,
        revokedAt: null,
      });

      expect(validTokens.length).toBe(1);
      expect(validTokens[0].tokenHash).toBe('token-hash-1');
    });
  });
});
