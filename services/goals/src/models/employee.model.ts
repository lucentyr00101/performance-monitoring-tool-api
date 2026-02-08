import mongoose, { Schema } from 'mongoose';

/**
 * Minimal Employee schema for cross-service population.
 * The actual Employee model lives in the employees service.
 * This stub allows Mongoose to populate employee references in goals.
 */
const employeeSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  status: String,
}, {
  collection: 'employees',
  strict: false,
});

export const Employee = mongoose.models.Employee as mongoose.Model<unknown> || mongoose.model('Employee', employeeSchema);
