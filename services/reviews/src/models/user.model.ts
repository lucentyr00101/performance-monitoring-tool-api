import mongoose, { Schema } from 'mongoose';

/**
 * Minimal User schema for cross-service population.
 * The actual User model lives in the auth service.
 * This stub allows Mongoose to populate user references in reviews.
 */
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: String,
  role: String,
}, {
  collection: 'users',
  strict: false,
});

export const User = mongoose.models.User as mongoose.Model<unknown> || mongoose.model('User', userSchema);
