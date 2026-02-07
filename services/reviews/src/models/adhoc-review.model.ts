import mongoose, { Document, Schema, Types } from 'mongoose';

export interface AdhocReviewAnswer {
  questionId: Types.ObjectId;
  value: string | number | boolean | string[];
}

export interface AdhocReviewSubmission {
  status: 'pending' | 'in_progress' | 'submitted';
  submittedAt?: Date;
  answers: AdhocReviewAnswer[];
}

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
  selfReview?: AdhocReviewSubmission;
  managerReview?: AdhocReviewSubmission;
  status:
    | 'initiated'
    | 'self_review_pending'
    | 'self_review_submitted'
    | 'manager_review_pending'
    | 'manager_review_submitted'
    | 'pending_acknowledgment'
    | 'acknowledged'
    | 'completed'
    | 'cancelled';
  acknowledgedAt?: Date;
  employeeComments?: string;
  acknowledgmentComments?: string;
  lastReminderSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewAnswerSchema = new Schema(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    value: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const reviewSubmissionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted'],
      default: 'pending',
    },
    submittedAt: { type: Date },
    answers: { type: [reviewAnswerSchema], default: [] },
  },
  { _id: false }
);

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
    selfReview: {
      type: reviewSubmissionSchema,
    },
    managerReview: {
      type: reviewSubmissionSchema,
    },
    status: {
      type: String,
      enum: [
        'initiated', 'self_review_pending', 'self_review_submitted',
        'manager_review_pending', 'manager_review_submitted',
        'pending_acknowledgment', 'acknowledged', 'completed', 'cancelled',
      ],
      default: 'initiated',
    },
    acknowledgedAt: {
      type: Date,
    },
    employeeComments: {
      type: String,
      maxlength: [2000, 'Employee comments cannot exceed 2000 characters'],
    },
    acknowledgmentComments: {
      type: String,
      maxlength: [2000, 'Acknowledgment comments cannot exceed 2000 characters'],
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
adhocReviewSchema.index({ managerId: 1, createdAt: -1 });
adhocReviewSchema.index({ status: 1 });
adhocReviewSchema.index({ triggeredBy: 1 });

export const AdhocReview = 
  (mongoose.models.AdhocReview as mongoose.Model<AdhocReviewDocument>) || 
  mongoose.model<AdhocReviewDocument>('AdhocReview', adhocReviewSchema);
