import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ReviewDocument extends Document {
  _id: Types.ObjectId;
  reviewCycleId: Types.ObjectId;
  employeeId: Types.ObjectId;
  reviewerId: Types.ObjectId;
  reviewerType: 'self' | 'manager' | 'peer' | 'hr';
  status: 'pending' | 'in_progress' | 'submitted' | 'acknowledged' | 'disputed' | 'finalized';
  responses?: Array<{
    questionId: Types.ObjectId;
    questionText?: string;
    responseType?: string;
    response?: unknown;
    rating?: number;
    comment?: string;
  }>;
  goalReviews?: Array<{
    goalId: Types.ObjectId;
    selfRating?: number;
    managerRating?: number;
    selfComment?: string;
    managerComment?: string;
    achievement?: number;
  }>;
  overallRating?: number;
  ratingsBreakdown?: Record<string, number>;
  overallComment?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  developmentGoals?: string[];
  privateNotes?: string;
  submittedAt?: Date;
  acknowledgedAt?: Date;
  employeeComments?: string;
  calibratedRating?: number;
  calibratedBy?: Types.ObjectId;
  calibratedAt?: Date;
  releasedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const reviewResponseSchema = new Schema({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  questionText: String,
  responseType: {
    type: String,
    enum: ['text', 'rating', 'scale', 'multiple_choice', 'yes_no'],
  },
  response: Schema.Types.Mixed,
  rating: Number,
  comment: String,
}, { _id: false });

const goalReviewSchema = new Schema({
  goalId: {
    type: Schema.Types.ObjectId,
    ref: 'Goal',
    required: true,
  },
  selfRating: { type: Number, min: 1, max: 5 },
  managerRating: { type: Number, min: 1, max: 5 },
  selfComment: String,
  managerComment: String,
  achievement: { type: Number, min: 0, max: 100 },
}, { _id: false });

const reviewSchema = new Schema<ReviewDocument>(
  {
    reviewCycleId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewCycle',
      required: [true, 'Review cycle ID is required'],
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
      index: true,
    },
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Reviewer ID is required'],
      index: true,
    },
    reviewerType: {
      type: String,
      enum: ['self', 'manager', 'peer', 'hr'],
      required: [true, 'Reviewer type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'submitted', 'acknowledged', 'disputed', 'finalized'],
      default: 'pending',
    },
    responses: [reviewResponseSchema],
    goalReviews: [goalReviewSchema],
    overallRating: { type: Number, min: 1, max: 5 },
    ratingsBreakdown: { type: Map, of: Number },
    overallComment: { type: String, maxlength: [5000, 'Overall comment cannot exceed 5000 characters'] },
    strengths: [{ type: String, trim: true }],
    areasForImprovement: [{ type: String, trim: true }],
    developmentGoals: [{ type: String, trim: true }],
    privateNotes: { type: String, maxlength: [2000, 'Private notes cannot exceed 2000 characters'] },
    submittedAt: { type: Date },
    acknowledgedAt: { type: Date },
    employeeComments: { type: String, maxlength: [2000, 'Employee comments cannot exceed 2000 characters'] },
    calibratedRating: { type: Number, min: 1, max: 5 },
    calibratedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    calibratedAt: { type: Date },
    releasedAt: { type: Date },
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

reviewSchema.index({ reviewCycleId: 1, employeeId: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ submittedAt: 1 });
reviewSchema.index(
  { reviewCycleId: 1, employeeId: 1, reviewerType: 1 },
  { unique: true }
);

export const Review = 
  (mongoose.models.Review as mongoose.Model<ReviewDocument>) || 
  mongoose.model<ReviewDocument>('Review', reviewSchema);
