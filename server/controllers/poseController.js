import SearchService from "../services/SearchService.js";
import Pose from "../models/Pose.js";

export const getPoses = async (req, res) => {
  try {
    const { category, search, page } = req.query;

    const pageNum = page ? parseInt(page) : 1;

    let categoryTerm = "wedding";
    if (search) {
      categoryTerm = search;
    } else if (category) {
      categoryTerm = Array.isArray(category) ? category[0] : category.split(",")[0];
    }

    // Call the clean Pexels Search Engine pipeline
    const results = await SearchService.executeSearch({
      category: categoryTerm,
      page: pageNum,
      user: req.user?.username || "Anonymous"
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
    const categories = [
      { id: "wedding", name: "Wedding", slug: "wedding" },
      { id: "birthday", name: "Birthday", slug: "birthday" },
      { id: "solo-male", name: "Solo Male", slug: "solo-male" },
      { id: "solo-female", name: "Solo Female", slug: "solo-female" },
      { id: "family", name: "Family", slug: "family" },
      { id: "travel", name: "Travel", slug: "travel" },
      { id: "baby", name: "Baby", slug: "baby" },
      { id: "traditional", name: "Traditional", slug: "traditional" },
      { id: "corporate", name: "Corporate", slug: "corporate" },
      { id: "fashion", name: "Fashion", slug: "fashion" },
      { id: "festival", name: "Festival", slug: "festival" },
    ];
    return res.json({ categories });
  } catch (error) {
    console.error("poseController getCategoriesList error:", error.message);
    res.status(500).json({ message: "Error retrieving categories" });
  }
};

export const getSimilarPoses = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await Pose.findOne({ $or: [{ id }, { _id: id }] });
    if (!target) {
      return res.status(404).json({ message: "Pose not found" });
    }

    // Retrieve other poses of different categories
    const allPoses = await Pose.find({
      id: { $ne: target.id },
      category: { $ne: target.category }
    }).limit(20);

    return res.json({ poses: allPoses });
  } catch (error) {
    console.error("poseController getSimilarPoses error:", error.message);
    res.status(500).json({ message: "Error retrieving similar poses" });
  }
};
