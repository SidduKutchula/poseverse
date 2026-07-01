import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["image_broken", "category_mismatch", "spam", "other"],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pose",
      required: true,
      index: true,
    },
    details: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.plugin(softDeletePlugin);

export default mongoose.model("Report", reportSchema);
