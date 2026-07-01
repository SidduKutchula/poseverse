import mongoose from "mongoose";
import softDeletePlugin from "./plugins/softDelete.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    role: {
      type: String,
      enum: ["user", "photographer", "admin"],
      default: "user",
      index: true,
    },
    googleId: {
      type: String,
      index: true,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
      default: "",
    },
    savedPoses: [
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

userSchema.plugin(softDeletePlugin);

export default mongoose.model("User", userSchema);
