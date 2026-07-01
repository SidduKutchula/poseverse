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

    // Step 3 & 4: Build optimized query
    const optimizedQuery = QueryBuilderService.buildQuery(category, filters);
    const queryEmbedding = await getCLIPTextEmbedding(optimizedQuery);

    // Step 5: Fetch 50 images per query
    let rawPhotos = [];
    try {
      rawPhotos = await PexelsService.searchPhotos(optimizedQuery, 50, page);
    } catch (error) {
      console.error("Primary Pexels query failed:", error.message);
    }

    // Step 10: Quality Filter (Reject Low Resolution, Broken, etc.)
    rawPhotos = rawPhotos.filter((photo) => {
      const width = photo.width || 0;
      const height = photo.height || 0;
      const hasSrc = photo.src?.large || photo.url;
      return width >= 600 && height >= 600 && hasSrc;
    });

    // Step 6: Remove duplicates
    let uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);

    // Step 10: If less than 20 unique images are returned, automatically generate synonym queries
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

    // Step 8: Store unique images in MongoDB cache first (without waiting for background queue)
    const cachedDocs = await ImageCacheService.cachePhotos(uniquePhotos, category);

    // Step 1 & 2: Push new unprocessed photos to the background processor queue
    for (const doc of cachedDocs) {
      if (!doc.processed) {
        imageProcessorQueue.enqueue(doc.id);
      }
    }

    // Step 6: Run Ranking Engine on cached MongoDB documents
    const rankedDocs = ImageRankingEngine.rank(cachedDocs, queryEmbedding, optimizedQuery);

    // Step 7: Normalize response output format
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

    // Step 9: Pagination - return a slice of 20 images sorted descending by matchScore
    const finalSorted = normalizedResults.sort((a, b) => b.matchScore - a.matchScore);
    return finalSorted.slice(0, 20);
  }
}

export default SearchService;
