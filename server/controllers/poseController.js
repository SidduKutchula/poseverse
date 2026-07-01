import * as poseService from "../services/poseService.js";

export const getPoses = async (req, res) => {
  try {
    const { category, style, lighting, difficulty, search, sort, page, limit } = req.query;

    // Parse array parameters or convert string queries to arrays
    const parseQueryArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      return val.split(",").map((s) => s.trim()).filter(Boolean);
    };

    const categories = parseQueryArray(category);
    const styles = parseQueryArray(style);
    const lightings = parseQueryArray(lighting);
    const difficulties = parseQueryArray(difficulty);

    const data = await poseService.getPosesFeed({
      categories,
      styles,
      lightings,
      difficulties,
      search,
      sort,
      page,
      limit,
    });

    return res.json(data);
  } catch (error) {
    console.error("Controller getPoses error:", error.message);
    res.status(500).json({ message: "Error retrieving poses" });
  }
};

export const getPoseById = async (req, res) => {
  try {
    const { id } = req.params;
    const pose = await poseService.getPoseDetails(id);
    return res.json({ pose });
  } catch (error) {
    console.error("Controller getPoseById error:", error.message);
    res.status(404).json({ message: error.message || "Pose not found" });
  }
};

export const getCategoriesList = async (req, res) => {
  try {
    const categories = await poseService.getCategories();
    return res.json({ categories });
  } catch (error) {
    console.error("Controller getCategoriesList error:", error.message);
    res.status(500).json({ message: "Error retrieving categories" });
  }
};
