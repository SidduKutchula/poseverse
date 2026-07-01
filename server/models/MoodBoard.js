import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const moodBoardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Mood Board",
    },
    poses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pose",
      },
    ],
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

moodBoardSchema.plugin(softDeletePlugin);

export default mongoose.model("MoodBoard", moodBoardSchema);
