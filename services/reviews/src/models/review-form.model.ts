import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ReviewFormQuestionDocument {
  _id: Types.ObjectId;
  text: string;
  helpText?: string;
  type: string;
  required?: boolean;
  forReviewer?: 'self' | 'manager' | 'both';
  weight?: number;
  config?: Record<string, unknown>;
}

export interface ReviewFormSectionDocument {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  order?: number;
  collapsible?: boolean;
  forReviewer?: 'self' | 'manager' | 'both';
  questions: ReviewFormQuestionDocument[];
}

export interface ReviewFormDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  instructions?: string;
  status: 'draft' | 'published' | 'archived';
  version: number;
  sections: ReviewFormSectionDocument[];
  settings?: {
    ratingScale?: {
      min?: number;
      max?: number;
    };
  };
  createdBy?: Types.ObjectId;
  publishedAt?: Date;
  archivedAt?: Date;
  isDefault?: boolean;
  parentFormId?: Types.ObjectId;
  departmentAssignments?: Array<{
    departmentId: string;
    formType: string;
    effectiveDate?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const reviewFormQuestionSchema = new Schema<ReviewFormQuestionDocument>(
  {
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [1000, 'Question text cannot exceed 1000 characters'],
    },
    helpText: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['rating_scale', 'text_short', 'text_long', 'multiple_choice', 'checkbox', 'yes_no', 'goal_rating', 'number'],
      required: [true, 'Question type is required'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    forReviewer: {
      type: String,
      enum: ['self', 'manager', 'both'],
      default: 'both',
    },
    weight: {
      type: Number,
      default: 1,
    },
    config: {
      type: Schema.Types.Mixed,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as Types.ObjectId).toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const reviewFormSectionSchema = new Schema<ReviewFormSectionDocument>(
  {
    title: {
      type: String,
      required: [true, 'Section title is required'],
      trim: true,
      maxlength: [200, 'Section title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    collapsible: {
      type: Boolean,
      default: false,
    },
    forReviewer: {
      type: String,
      enum: ['self', 'manager', 'both'],
      default: 'both',
    },
    questions: [reviewFormQuestionSchema],
  },
  {
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as Types.ObjectId).toString();
        delete ret._id;
        return ret;
      },
    },
  }
);

const reviewFormSchema = new Schema<ReviewFormDocument>(
  {
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
      maxlength: [255, 'Form name cannot exceed 255 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    instructions: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    version: {
      type: Number,
      default: 1,
    },
    sections: [reviewFormSectionSchema],
    settings: {
      ratingScale: {
        min: { type: Number, default: 1 },
        max: { type: Number, default: 5 },
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: {
      type: Date,
    },
    archivedAt: {
      type: Date,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    parentFormId: {
      type: Schema.Types.ObjectId,
      ref: 'ReviewForm',
    },
    departmentAssignments: [{
      departmentId: { type: String },
      formType: { type: String, enum: ['self', 'manager', 'both'] },
      effectiveDate: { type: Date },
    }],
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

// Virtual fields for counts
reviewFormSchema.virtual('sectionsCount').get(function (this: ReviewFormDocument) {
  return this.sections?.length || 0;
});

reviewFormSchema.virtual('questionsCount').get(function (this: ReviewFormDocument) {
  if (!this.sections || this.sections.length === 0) return 0;
  return this.sections.reduce((total, section) => {
    return total + (section.questions?.length || 0);
  }, 0);
});

reviewFormSchema.index({ name: 1 });
reviewFormSchema.index({ status: 1 });
reviewFormSchema.index({ isDefault: 1 });

export const ReviewForm = 
  (mongoose.models.ReviewForm as mongoose.Model<ReviewFormDocument>) || 
  mongoose.model<ReviewFormDocument>('ReviewForm', reviewFormSchema);
