import mongoose, { Document, Schema, Types } from 'mongoose';

export interface AdhocReviewDocument extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  managerId?: Types.ObjectId;
  triggeredBy: Types.ObjectId;
  reason?: string;
  reviewFormId?: Types.ObjectId;
  dueDate?: Date;
  settings?: {
    selfReviewRequired?: boolean;
    managerReviewRequired?: boolean;
    includeGoals?: boolean;
  };
  status: 'initiated' | 'pending_acknowledgment' | 'completed' | 'cancelled';
  acknowledgedAt?: Date;
  employeeComments?: string;
  lastReminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adhocReviewSchema = new Schema<AdhocReviewDocument>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    triggeredBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Triggered by is required'],
    },
    reason: {
      type: String,
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    reviewFormId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewForm',
    },
    dueDate: {
      type: Date,
    },
    settings: {
      selfReviewRequired: { type: Boolean, default: true },
      managerReviewRequired: { type: Boolean, default: true },
      includeGoals: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['initiated', 'pending_acknowledgment', 'completed', 'cancelled'],
      default: 'initiated',
    },
    acknowledgedAt: {
      type: Date,
    },
    employeeComments: {
      type: String,
      maxlength: [2000, 'Employee comments cannot exceed 2000 characters'],
    },
    lastReminderSentAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as Types.ObjectId).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

adhocReviewSchema.index({ employeeId: 1, createdAt: -1 });
adhocReviewSchema.index({ status: 1 });
adhocReviewSchema.index({ triggeredBy: 1 });

export const AdhocReview = 
  (mongoose.models.AdhocReview as mongoose.Model<AdhocReviewDocument>) || 
  mongoose.model<AdhocReviewDocument>('AdhocReview', adhocReviewSchema);
