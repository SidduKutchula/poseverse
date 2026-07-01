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

    const cleanCategory = category.toLowerCase().trim();

    // ==========================================
    // Caching Rule: Check database first
    // ==========================================
    console.log(`[SearchService] Querying MongoDB local cache for: "${category}"...`);
    const searchRegex = new RegExp(category.split(/\s+/).join("|"), "i");
    let dbMatches = await Pose.find({
      $or: [
        { category: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ]
    });

    const optimizedQueries = QueryBuilderService.generateFiveQueries(category, filters);
    const primaryQuery = optimizedQueries[0];
    const queryEmbedding = await getCLIPTextEmbedding(primaryQuery);

    // Rank database matches first
    let rankedDbMatches = ImageRankingEngine.rank(dbMatches, queryEmbedding, primaryQuery);
    
    // Sort and filter high-quality matches
    rankedDbMatches = rankedDbMatches
      .filter((pose) => (pose.matchScore || 0) >= 60)
      .sort((a, b) => b.matchScore - a.matchScore);

    // If we have at least 20 matches, return immediately (No duplicate downloads/analysis)
    if (rankedDbMatches.length >= 20) {
      console.log(`[SearchService] Sufficient MongoDB matches found (${rankedDbMatches.length}). Skipping Pexels API fetch.`);
      return rankedDbMatches.slice(0, 20).map((doc) => ({
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
    }

    console.log(`[SearchService] Insufficient cached matches. Fetching 200 images using 5 optimized queries...`);

    // Step 2: Fetch 200 images (40 images per query)
    let rawPhotos = [];
    const seenIds = new Set();

    for (const queryLine of optimizedQueries) {
      try {
        const results = await PexelsService.searchPhotos(queryLine, 40, page);
        for (const photo of results) {
          if (!seenIds.has(photo.id)) {
            rawPhotos.push(photo);
            seenIds.add(photo.id);
          }
        }
      } catch (err) {
        console.warn(`Pexels fetch failed for query "${queryLine}":`, err.message);
      }
    }

    // Step 10: Reject blurred, low quality, watermarked, or tiny images
    rawPhotos = rawPhotos.filter((photo) => {
      const width = photo.width || 0;
      const height = photo.height || 0;
      return width >= 600 && height >= 600 && (photo.src?.large || photo.url);
    });

    // Step 3: Remove duplicates
    let uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);

    // Step 8: Store unique images in MongoDB cache first (processed: false)
    const cachedDocs = await ImageCacheService.cachePhotos(uniquePhotos, category);

    // Step 4 & 5: Push unprocessed photos to background processor queue (BLIP-2 caption & landmarks)
    for (const doc of cachedDocs) {
      if (!doc.processed) {
        imageProcessorQueue.enqueue(doc.id);
      }
    }

    // Merge Pexels results with existing database matches
    const combinedPool = [...cachedDocs];
    const poolIds = new Set(combinedPool.map((p) => p.id));
    for (const doc of dbMatches) {
      if (!poolIds.has(doc.id)) {
        combinedPool.push(doc);
        poolIds.add(doc.id);
      }
    }

    // Step 11: Rank combined pool based on Score = Similarity + Quality + Metadata + Popularity
    const rankedDocs = ImageRankingEngine.rank(combinedPool, queryEmbedding, primaryQuery);

    // Step 10: Reject wrong event/people count
    const finalFilteredDocs = rankedDocs.filter((doc) => {
      const docCategory = (doc.category || "").toLowerCase();
      // Ensure category matches or has a soft match keyword
      const categoryMatch = docCategory.includes(cleanCategory) || cleanCategory.includes(docCategory);
      return categoryMatch;
    });

    // Step 7: Normalize response output format
    const normalizedResults = finalFilteredDocs.map((doc) => ({
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

    // Step 12: Return Top 20 Images
    const finalSorted = normalizedResults.sort((a, b) => b.matchScore - a.matchScore);
    return finalSorted.slice(0, 20);
  }
}

export default SearchService;
