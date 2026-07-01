import QueryBuilderService from "./QueryBuilderService.js";
import PexelsService from "./PexelsService.js";
import DuplicateRemovalService from "./DuplicateRemovalService.js";
import ImageCacheService from "./ImageCacheService.js";
import ImageRankingEngine from "./ImageRankingEngine.js";
import { getCLIPTextEmbedding } from "./aiService.js";
import { imageProcessorQueue } from "./ImageProcessorQueue.js";
import Pose from "../models/Pose.js";

export class SearchService {
  static async executeSearch({ category, filters = {}, page = 1 }) {
    if (!category) {
      throw new Error("Category parameter is required");
    }

    const optimizedQuery = QueryBuilderService.buildQuery(category, filters);
    const queryEmbedding = await getCLIPTextEmbedding(optimizedQuery);

    // ==========================================
    // Database-First Caching Strategy (Phase 7)
    // ==========================================
    console.log(`[SearchService] Searching local database first for category: "${category}"...`);
    const searchRegex = new RegExp(category.split(/\s+/).join("|"), "i");
    
    let dbMatches = await Pose.find({
      $or: [
        { category: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ]
    });

    // Score database matches using the CLIP Text vs Image Embeddings
    let rankedDbMatches = ImageRankingEngine.rank(dbMatches, queryEmbedding, optimizedQuery);
    
    // Sort and filter high-quality matches
    rankedDbMatches = rankedDbMatches
      .filter((pose) => (pose.matchScore || 0) >= 60) // soft filter for cache
      .sort((a, b) => b.matchScore - a.matchScore);

    // If we have at least 20 local matching images, return them immediately
    if (rankedDbMatches.length >= 20) {
      console.log(`[SearchService] Found sufficient local cached database matches (${rankedDbMatches.length}). Returning cached set.`);
      
      const normalizedResults = rankedDbMatches.map((doc) => ({
        id: doc.id,
        _id: doc._id,
        title: doc.name,
        image: doc.image,
        photographer: doc.photographer || "Pexels Creator",
        category: doc.category,
        categoryLabel: doc.categoryLabel,
        width: doc.width || 1920,
        height: doc.height || 1080,
        alt: doc.description,
        source: "database",
        matchScore: doc.matchScore,
        processed: doc.processed || false
      }));

      return normalizedResults.slice(0, 20);
    }

    console.log(`[SearchService] Insufficient cached matches (${rankedDbMatches.length}). Requesting real Pexels API fallback...`);

    // Fetch 50 images per query
    let rawPhotos = [];
    try {
      rawPhotos = await PexelsService.searchPhotos(optimizedQuery, 50, page);
    } catch (error) {
      console.error("Primary Pexels query failed:", error.message);
    }

    // Quality Filter (Reject Low Resolution, Broken, etc.)
    rawPhotos = rawPhotos.filter((photo) => {
      const width = photo.width || 0;
      const height = photo.height || 0;
      const hasSrc = photo.src?.large || photo.url;
      return width >= 600 && height >= 600 && hasSrc;
    });

    // Remove duplicates
    let uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);

    // Synonym query retry if unique results are under 20
    let retryIndex = 0;
    while (uniquePhotos.length < 20 && retryIndex < 2) {
      const synonymQuery = QueryBuilderService.getSynonyms(category, retryIndex);
      try {
        const retryPhotos = await PexelsService.searchPhotos(synonymQuery, 50, page);
        const validRetryPhotos = retryPhotos.filter((photo) => (photo.width || 0) >= 600 && (photo.height || 0) >= 600);
        rawPhotos = [...rawPhotos, ...validRetryPhotos];
        uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);
      } catch (err) {
        console.warn(`Synonym query failed: "${synonymQuery}"`, err.message);
      }
      retryIndex++;
    }

    // Store unique images in MongoDB cache first (without blocking request thread)
    const cachedDocs = await ImageCacheService.cachePhotos(uniquePhotos, category);

    // Push new unprocessed photos to the background processor queue
    for (const doc of cachedDocs) {
      if (!doc.processed) {
        imageProcessorQueue.enqueue(doc.id);
      }
    }

    // Merge Pexels results with existing database matches to build a complete pool
    const combinedPool = [...cachedDocs];
    const seenIds = new Set(combinedPool.map((p) => p.id));
    for (const doc of dbMatches) {
      if (!seenIds.has(doc.id)) {
        combinedPool.push(doc);
        seenIds.add(doc.id);
      }
    }

    // Run Ranking Engine on combined pool
    const rankedDocs = ImageRankingEngine.rank(combinedPool, queryEmbedding, optimizedQuery);

    // Normalize response output format
    const normalizedResults = rankedDocs.map((doc) => ({
      id: doc.id,
      _id: doc._id,
      title: doc.name,
      image: doc.image,
      photographer: doc.photographer || "Pexels Creator",
      category: doc.category,
      categoryLabel: doc.categoryLabel,
      width: doc.width || 1920,
      height: doc.height || 1080,
      alt: doc.description,
      source: "pexels",
      matchScore: doc.matchScore,
      processed: doc.processed || false
    }));

    // Pagination - return top 20 images sorted descending by matchScore
    const finalSorted = normalizedResults.sort((a, b) => b.matchScore - a.matchScore);
    return finalSorted.slice(0, 20);
  }
}

export default SearchService;
