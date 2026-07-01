import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const poseSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    categoryLabel: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Easy", "Intermediate", "Pro"],
      required: true,
      index: true,
    },
    peopleCount: {
      type: String,
      enum: ["Solo", "Couple", "Group"],
      index: true,
    },
    locationType: {
      type: String,
      enum: ["Indoor", "Outdoor", "Both"],
      index: true,
    },
    style: {
      type: String,
      trim: true,
    },
    cameraAngle: {
      type: String,
      trim: true,
    },
    lightingSuggestion: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    steps: [
      {
        label: { type: String, trim: true },
        description: { type: String, trim: true },
      },
    ],
    bestSettings: {
      lens: { type: String, trim: true },
      aperture: { type: String, trim: true },
      light: { type: String, trim: true },
      outfit: { type: String, trim: true },
    },
    image: {
      type: String,
      required: true,
    },
    imageVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    thumbnails: [
      {
        type: String,
      },
    ],
    trending: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for optimizing catalog searches and category feeds
poseSchema.index({ category: 1, trending: -1 });

poseSchema.plugin(softDeletePlugin);

export default mongoose.model("Pose", poseSchema);
