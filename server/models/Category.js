import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    poseCount: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

categorySchema.plugin(softDeletePlugin);

export default mongoose.model("Category", categorySchema);
