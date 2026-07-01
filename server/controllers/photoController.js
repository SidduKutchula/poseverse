import SearchService from "../services/SearchService.js";

export const getPhotos = async (req, res) => {
  try {
    const { category, pose, lighting, background, page } = req.query;

    const pageNum = page ? parseInt(page) : 1;
    const filters = { pose, lighting, background };

    // Execute strict deduplicated pexels search caching pipeline
    const results = await SearchService.executeSearch({
      category: category || "wedding",
      filters,
      page: pageNum
    });

    return res.json(results);
  } catch (error) {
    console.error("photoController getPhotos error:", error.message);
    res.status(500).json({ error: error.message || "Failed to search photos" });
  }
};
