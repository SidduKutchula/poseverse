import SearchService from "../services/SearchService.js";

export const getPhotos = async (req, res) => {
  try {
    const { category, page } = req.query;

    const pageNum = page ? parseInt(page) : 1;

    // Execute MERN Pexels Search Engine pipeline
    const results = await SearchService.executeSearch({
      category: category || "wedding",
      page: pageNum,
      user: req.user?.username || "Anonymous"
    });

    return res.json(results);
  } catch (error) {
    console.error("photoController getPhotos error:", error.message);
    res.status(500).json({ error: error.message || "Failed to search photos" });
  }
};
