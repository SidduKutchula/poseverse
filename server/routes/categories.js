import express from "express";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import { CATEGORIES } from "../../client/src/data/poses.js";

const router = express.Router();

const isDbConnected = () => mongoose.connection.readyState === 1;

// GET all categories
router.get("/", async (req, res) => {
  try {
    if (isDbConnected()) {
      const dbCategories = await Category.find({});
      if (dbCategories.length > 0) {
        return res.json(dbCategories);
      }
    }
    // Return mock categories
    return res.json(CATEGORIES);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server error fetching categories" });
  }
});

export default router;
