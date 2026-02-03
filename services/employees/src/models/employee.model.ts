import mongoose, { Document, Schema, Types } from 'mongoose';
import type { IEmployee } from '@pmt/shared';

export interface EmployeeDocument extends Omit<IEmployee, '_id'>, Document {
  _id: Types.ObjectId;
}

const employeeSchema = new Schema<EmployeeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [100, 'First name cannot exceed 100 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [100, 'Last name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters'],
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    hireDate: {
      type: Date,
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'terminated'],
      default: 'active',
    },
    avatarUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: unknown, ret: Record<string, unknown>) => {
        ret.id = (ret._id as object).toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ departmentId: 1 });
employeeSchema.index({ managerId: 1 });
employeeSchema.index({ status: 1 });
employeeSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

// Virtual for full name
employeeSchema.virtual('fullName').get(function(this: EmployeeDocument) {
  return `${this.firstName} ${this.lastName}`;
});

// Generate employee code before saving
employeeSchema.pre('save', async function(next) {
  if (!this.employeeCode) {
    // Use a combination of timestamp and random number to ensure uniqueness
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    this.employeeCode = `EMP-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

export const Employee = mongoose.models.Employee as mongoose.Model<EmployeeDocument> || mongoose.model<EmployeeDocument>('Employee', employeeSchema);
