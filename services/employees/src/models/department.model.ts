import mongoose, { Document, Schema, Types } from 'mongoose';
import type { IDepartment } from '@pmt/shared';

export interface DepartmentDocument extends Omit<IDepartment, '_id'>, Document {
  _id: Types.ObjectId;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Department name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
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

// Indexes (name already has unique index from schema definition)
departmentSchema.index({ parentId: 1 });
departmentSchema.index({ managerId: 1 });
departmentSchema.index({ status: 1 });

export const Department = mongoose.models.Department as mongoose.Model<DepartmentDocument> || mongoose.model<DepartmentDocument>('Department', departmentSchema);
