import express from "express";
import mongoose from "mongoose";
import { protect, adminOnly } from "../middleware/auth.js";
import Pose from "../models/Pose.js";
import User from "../models/User.js";
import MoodBoard from "../models/MoodBoard.js";
import { POSES } from "../../client/src/data/poses.js";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET stats
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    if (isDbConnected()) {
      const totalUsers = await User.countDocuments();
      const totalPoses = await Pose.countDocuments();
      const totalBoards = await MoodBoard.countDocuments();

      return res.json({
        totalUsers,
        totalPoses,
        totalBoards,
        databaseMode: "MongoDB"
      });
    } else {
      // Fallback stats
      return res.json({
        totalUsers: 57, // dummy offline stats
        totalPoses: POSES.length,
        totalBoards: 14,
        databaseMode: "Offline/In-Memory"
      });
    }
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({ message: "Error fetching admin stats" });
  }
});

// POST add pose
router.post("/poses", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      categoryLabel,
      difficulty,
      peopleCount,
      locationType,
      style,
      cameraAngle,
      lightingSuggestion,
      tags,
      steps,
      bestSettings,
      image,
      thumbnails
    } = req.body;

    if (!name || !category || !difficulty || !image) {
      return res.status(400).json({ message: "Name, category, difficulty and image are required" });
    }

    const uniqueId = "pose_" + Date.now();

    const poseData = {
      id: uniqueId,
      name,
      description,
      category,
      categoryLabel: categoryLabel || category.charAt(0).toUpperCase() + category.slice(1),
      difficulty,
      peopleCount: peopleCount || "Couple",
      locationType: locationType || "Both",
      style: style || "Cinematic",
      cameraAngle: cameraAngle || "Eye level",
      lightingSuggestion: lightingSuggestion || "Natural light",
      tags: Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map(t => t.trim()) : [],
      steps: Array.isArray(steps) ? steps : [],
      bestSettings: bestSettings || {
        lens: "85mm portrait",
        aperture: "f/1.8",
        light: lightingSuggestion || "Natural light",
        outfit: "Traditional or Smart Casual"
      },
      image,
      imageVerified: true,
      thumbnails: Array.isArray(thumbnails) && thumbnails.length > 0 ? thumbnails : [image, image, image],
      trending: false
    };

    if (isDbConnected()) {
      const newPose = new Pose(poseData);
      await newPose.save();
      return res.status(201).json(newPose);
    } else {
      // In-Memory edit: mutate the array
      const offlinePose = {
        ...poseData,
        _id: uniqueId
      };
      POSES.unshift(offlinePose);
      return res.status(201).json(offlinePose);
    }
  } catch (error) {
    console.error("Admin add pose error:", error);
    res.status(500).json({ message: "Error adding pose" });
  }
});

// PUT toggle trending status
router.put("/poses/:id/trending", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const pose = await Pose.findOne({ $or: [{ id }, { _id: id }] });
      if (!pose) {
        return res.status(404).json({ message: "Pose not found" });
      }

      pose.trending = !pose.trending;
      await pose.save();
      return res.json(pose);
    } else {
      // Offline fallback
      const poseIndex = POSES.findIndex((p) => p.id === id || p._id === id);
      if (poseIndex === -1) {
        return res.status(404).json({ message: "Pose not found" });
      }

      POSES[poseIndex].trending = !POSES[poseIndex].trending;
      return res.json(POSES[poseIndex]);
    }
  } catch (error) {
    console.error("Admin toggle trending error:", error);
    res.status(500).json({ message: "Error toggling trending status" });
  }
});

// DELETE pose
router.delete("/poses/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const result = await Pose.findOneAndDelete({ $or: [{ id }, { _id: id }] });
      if (!result) {
        return res.status(404).json({ message: "Pose not found" });
      }
      return res.json({ message: "Pose deleted successfully", id });
    } else {
      // Offline fallback
      const poseIndex = POSES.findIndex((p) => p.id === id || p._id === id);
      if (poseIndex === -1) {
        return res.status(404).json({ message: "Pose not found" });
      }

      POSES.splice(poseIndex, 1);
      return res.json({ message: "Pose deleted successfully from memory", id });
    }
  } catch (error) {
    console.error("Admin delete pose error:", error);
    res.status(500).json({ message: "Error deleting pose" });
  }
});

export default router;
