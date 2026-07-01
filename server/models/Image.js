import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const imageAssetSchema = new mongoose.Schema(
  {
    poseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pose",
      index: true,
      default: null,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    secureUrl: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      trim: true,
    },
    bytes: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

imageAssetSchema.plugin(softDeletePlugin);

export default mongoose.model("Image", imageAssetSchema);
