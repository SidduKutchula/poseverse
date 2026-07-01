import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

sessionSchema.plugin(softDeletePlugin);

export default mongoose.model("Session", sessionSchema);
