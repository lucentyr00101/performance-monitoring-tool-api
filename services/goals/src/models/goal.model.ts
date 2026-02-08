import mongoose, { Document, Schema, Types } from 'mongoose';
import type { IGoal, IKeyResult } from '@pmt/shared';

export interface KeyResultDocument extends IKeyResult {
  _id: Types.ObjectId;
}

export interface GoalDocument extends Omit<IGoal, '_id' | 'keyResults'>, Document {
  _id: Types.ObjectId;
  keyResults: KeyResultDocument[];
  completedAt?: Date;
}

const keyResultSchema = new Schema<KeyResultDocument>(
  {
    title: {
      type: String,
      required: [true, 'Key result title is required'],
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    targetValue: {
      type: Number,
      required: [true, 'Target value is required'],
      min: [0, 'Target value cannot be negative'],
    },
    currentValue: {
      type: Number,
      default: 0,
      min: [0, 'Current value cannot be negative'],
    },
    unit: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as object).toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

// Virtual for progress percentage
keyResultSchema.virtual('progress').get(function(this: KeyResultDocument) {
  if (this.targetValue === 0) return 0;
  return Math.min(100, Math.round((this.currentValue / this.targetValue) * 100));
});

const goalSchema = new Schema<GoalDocument>(
  {
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [255, 'Title cannot exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['individual', 'team', 'department', 'company'],
      required: [true, 'Goal type is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'draft',
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100'],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Owner ID is required'],
      index: true,
    },
    parentGoalId: {
      type: Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
    },
    startDate: {
      type: Date,
    },
    dueDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    keyResults: [keyResultSchema],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as object).toString();
        delete ret._id;
        delete ret.__v;
        
        // Format date fields to YYYY-MM-DD (keep timestamps as ISO 8601)
        if (ret.startDate instanceof Date) {
          ret.startDate = ret.startDate.toISOString().split('T')[0];
        }
        if (ret.dueDate instanceof Date) {
          ret.dueDate = ret.dueDate.toISOString().split('T')[0];
        }
        
        return ret;
      },
    },
  }
);

// Indexes
goalSchema.index({ ownerId: 1, status: 1 });
goalSchema.index({ type: 1 });
goalSchema.index({ status: 1 });
goalSchema.index({ dueDate: 1 });
goalSchema.index({ title: 'text', description: 'text' });

// Method to calculate progress from key results
goalSchema.methods.calculateProgress = function() {
  if (!this.keyResults || this.keyResults.length === 0) {
    return this.progress;
  }

  const total = this.keyResults.length;
  if (total === 0) return 0;

  const weightedProgress = this.keyResults.reduce((sum: number, kr: KeyResultDocument) => {
    const krProgress = kr.targetValue > 0 
      ? Math.min(100, (kr.currentValue / kr.targetValue) * 100)
      : 0;
    return sum + krProgress;
  }, 0);

  return Math.round(weightedProgress / total);
};

// Pre-save hook to update progress
goalSchema.pre('save', function(next) {
  if (this.keyResults && this.keyResults.length > 0) {
    this.progress = (this as unknown as { calculateProgress: () => number }).calculateProgress();
  }
  next();
});

export const Goal: mongoose.Model<GoalDocument> = mongoose.models.Goal as mongoose.Model<GoalDocument> || mongoose.model<GoalDocument>('Goal', goalSchema);
