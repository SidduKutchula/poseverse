import "dotenv/config";
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Pose from "../models/Pose.js";
import { CATEGORIES, POSES } from "../../client/src/data/poses.js";
import { validatePoses } from "../scripts/validatePoses.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/poseverse";

async function seedDatabase() {
  try {
    console.log("Running structural validation check...");
    validatePoses();

    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB successfully!");

    // Clear existing data
    console.log("Clearing existing Categories and Poses...");
    await Category.deleteMany({});
    await Pose.deleteMany({});

    // Seed Categories
    console.log("Seeding Categories...");
    // Map 'label' to 'name' to align with the Mongoose Category Schema definition
    const formattedCategories = CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.label,
      slug: cat.slug,
      icon: cat.icon,
      poseCount: cat.count || 0,
    }));

    const createdCategories = await Category.insertMany(formattedCategories);
    console.log(`Seeded ${createdCategories.length} categories.`);

    // Seed Poses
    console.log("Seeding Poses...");
    // Map local string id to _id so it exists as referenceable, but keeps original string id as backup
    const formattedPoses = POSES.map((pose, idx) => ({
      ...pose,
      // We keep pose.id (like "w1"), but let Mongoose auto-generate ObjectId for _id
      // to keep Mongoose cast refs clean and stable.
    }));

    const createdPoses = await Pose.insertMany(formattedPoses);
    console.log(`Seeded ${createdPoses.length} poses.`);

    // Update Pose counts in Categories
    console.log("Updating category pose counts...");
    for (const category of createdCategories) {
      const count = await Pose.countDocuments({ category: category.slug });
      category.poseCount = count;
      await category.save();
    }
    console.log("Category pose counts updated successfully!");

    console.log("Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
