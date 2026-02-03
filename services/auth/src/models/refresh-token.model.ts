import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IRefreshToken } from '@pmt/shared';

export interface RefreshTokenDocument extends Omit<IRefreshToken, '_id'>, Document {}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revokedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to auto-delete expired tokens
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken: Model<RefreshTokenDocument> = mongoose.models.RefreshToken as Model<RefreshTokenDocument> || mongoose.model<RefreshTokenDocument>(
  'RefreshToken',
  refreshTokenSchema
);
