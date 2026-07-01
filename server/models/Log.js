import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const logSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

logSchema.plugin(softDeletePlugin);

export default mongoose.model("Log", logSchema);
