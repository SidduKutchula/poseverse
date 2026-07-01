import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const aiHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    occasion: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    people: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      trim: true,
    },
    experience: {
      type: String,
      trim: true,
    },
    timeOfDay: {
      type: String,
      trim: true,
    },
    suggestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pose",
      },
    ],
  },
  {
    timestamps: true,
  }
);

aiHistorySchema.plugin(softDeletePlugin);

export default mongoose.model("AIHistory", aiHistorySchema);
