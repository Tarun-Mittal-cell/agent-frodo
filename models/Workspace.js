import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema({
  messages: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  fileData: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  user: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Number,
    default: () => Date.now(),
  },
});

// Add index for better performance
WorkspaceSchema.index({ user: 1 });

// Use mongoose.models to prevent model recompilation error
const Workspace =
  mongoose.models.Workspace || mongoose.model("Workspace", WorkspaceSchema);

export default Workspace;
