import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

// Optimize query for checking if a user has reviewed a pose
reviewSchema.index({ userId: 1, poseId: 1 });

reviewSchema.plugin(softDeletePlugin);

export default mongoose.model("Review", reviewSchema);
