import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    poseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pose",
      required: true,
      index: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate favorites for the same user-pose combination
favoriteSchema.index({ userId: 1, poseId: 1 }, { unique: true });

favoriteSchema.plugin(softDeletePlugin);

export default mongoose.model("Favorite", favoriteSchema);
