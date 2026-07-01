import SearchService from "../services/SearchService.js";
import Pose from "../models/Pose.js";

export const getPoses = async (req, res) => {
  try {
    const { category, style, lighting, search, page } = req.query;

    const pageNum = page ? parseInt(page) : 1;

    // Use search string or the first category value, fallback to "wedding"
    let categoryTerm = "wedding";
    if (search) {
      categoryTerm = search;
    } else if (category) {
      categoryTerm = Array.isArray(category) ? category[0] : category.split(",")[0];
    }

    const filters = {
      pose: style,
      lighting,
    };

    // Execute real Pexels search & deduplication
    const results = await SearchService.executeSearch({
      category: categoryTerm,
      filters,
      page: pageNum,
    });

    return res.json({
      poses: results,
      pagination: {
        total: 100,
        page: pageNum,
        pages: 5,
      },
    });
  } catch (error) {
    console.error("poseController getPoses error:", error.message);
    res.status(500).json({ message: "Error retrieving poses" });
  }
};

export const getPoseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the pose in MongoDB
    const pose = await Pose.findOne({ $or: [{ id }, { _id: id }] });
    if (!pose) {
      return res.status(404).json({ message: "Pose not found" });
    }

    return res.json({ pose });
  } catch (error) {
    console.error("poseController getPoseById error:", error.message);
    res.status(404).json({ message: "Pose not found" });
  }
};

export const getCategoriesList = async (req, res) => {
  try {
    // Return standard categories
    const categories = [
      { id: "wedding", name: "Wedding", slug: "wedding" },
      { id: "birthday", name: "Birthday", slug: "birthday" },
      { id: "pre-wedding", name: "Pre Wedding", slug: "pre-wedding" },
      { id: "baby-shoot", name: "Baby Shoot", slug: "baby-shoot" },
      { id: "family", name: "Family", slug: "family" },
      { id: "travel", name: "Travel", slug: "travel" },
      { id: "fashion", name: "Fashion", slug: "fashion" },
      { id: "traditional", name: "Traditional", slug: "traditional" },
      { id: "festival", name: "Festival", slug: "festival" },
      { id: "corporate", name: "Corporate", slug: "corporate" },
    ];
    return res.json({ categories });
  } catch (error) {
    console.error("poseController getCategoriesList error:", error.message);
    res.status(500).json({ message: "Error retrieving categories" });
  }
};
