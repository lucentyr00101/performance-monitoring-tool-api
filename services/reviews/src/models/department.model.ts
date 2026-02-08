import mongoose, { Schema } from 'mongoose';

/**
 * Minimal Department schema for cross-service population.
 * The actual Department model lives in the employees service.
 * This stub allows Mongoose to populate department references in reviews.
 */
const departmentSchema = new Schema({
  name: { type: String, required: true },
  description: String,
}, {
  collection: 'departments',
  strict: false,
});

export const Department = mongoose.models.Department as mongoose.Model<unknown> || mongoose.model('Department', departmentSchema);
