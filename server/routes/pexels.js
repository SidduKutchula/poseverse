import express from "express";
import PexelsService from "../services/PexelsService.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { query, count } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Missing required search query param" });
    }

    const limit = count ? parseInt(count) : 12;
    const results = await PexelsService.searchPhotos(query, limit);

    return res.json({ query, results });
  } catch (error) {
    console.error("Pexels Router search error:", error.message);
    res.status(500).json({ error: "Failed to perform Pexels search" });
  }
});

export default router;
