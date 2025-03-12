import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // This sets an index automatically
  },
  picture: {
    type: String,
  },
  uid: {
    type: String,
    required: true,
  },
  token: {
    type: Number,
    default: 50000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add only one index for uid
UserSchema.index({ uid: 1 });

// Remove this line to prevent duplicate index warnings:
// UserSchema.index({ email: 1 }, { unique: true });

// Use mongoose.models to prevent model recompilation error
export default mongoose.models.User || mongoose.model("User", UserSchema);
