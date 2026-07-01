import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "alert", "share"],
      default: "info",
      index: true,
    },
    readStatus: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Fast lookup for unread notifications by user
notificationSchema.index({ userId: 1, readStatus: 1 });

notificationSchema.plugin(softDeletePlugin);

export default mongoose.model("Notification", notificationSchema);
