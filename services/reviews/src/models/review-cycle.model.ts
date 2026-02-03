import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ReviewCycleDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  type: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate: Date;
  departments?: Types.ObjectId[];
  settings?: {
    selfReviewEnabled?: boolean;
    peerReviewEnabled?: boolean;
    includeGoalReview?: boolean;
    requireCalibration?: boolean;
    allowEmployeeViewBeforeRelease?: boolean;
  };
  createdBy?: Types.ObjectId;
  launchedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewCycleSchema = new Schema<ReviewCycleDocument>(
  {
    name: {
      type: String,
      required: [true, 'Review cycle name is required'],
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['annual', 'semi_annual', 'quarterly', 'monthly', 'probation', 'project', 'ad_hoc'],
      required: [true, 'Review cycle type is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    departments: [{
      type: Schema.Types.ObjectId,
      ref: 'Department',
    }],
    settings: {
      selfReviewEnabled: { type: Boolean, default: true },
      peerReviewEnabled: { type: Boolean, default: false },
      includeGoalReview: { type: Boolean, default: true },
      requireCalibration: { type: Boolean, default: false },
      allowEmployeeViewBeforeRelease: { type: Boolean, default: false },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    launchedAt: { type: Date },
    completedAt: { type: Date },
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

reviewCycleSchema.index({ status: 1 });
reviewCycleSchema.index({ type: 1 });
reviewCycleSchema.index({ startDate: 1 });

export const ReviewCycle = 
  (mongoose.models.ReviewCycle as mongoose.Model<ReviewCycleDocument>) || 
  mongoose.model<ReviewCycleDocument>('ReviewCycle', reviewCycleSchema);
