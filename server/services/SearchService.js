import QueryBuilderService from "./QueryBuilderService.js";
import PexelsService from "./PexelsService.js";
import DuplicateService from "./DuplicateService.js";
import CacheService from "./CacheService.js";
import SearchHistory from "../models/SearchHistory.js";
import Pose from "../models/Pose.js";

export class SearchService {
  static async executeSearch({ category, filters = {}, page = 1, user = "Anonymous" }) {
    if (!category) {
      throw new Error("Category parameter is required");
    }

    const startTime = Date.now();
    const cleanCategory = category.toLowerCase().trim();

    // Step 2 & 3: Generate 3 optimized queries
    const queries = QueryBuilderService.generateThreeQueries(cleanCategory);
    const primaryQuery = queries[0];

    // Step 17: Log search history entry
    await SearchHistory.create({
      user,
      category: cleanCategory,
      generatedQuery: primaryQuery,
      timestamp: new Date()
    });

    // ==========================================
    // Caching Rule: Check database first
    // ==========================================
    const searchRegex = new RegExp(cleanCategory.split(/\s+/).join("|"), "i");
    let dbMatches = await Pose.find({
      $or: [
        { category: { $regex: searchRegex } },
        { name: { $regex: searchRegex } },
        { description: { $regex: searchRegex } }
      ]
    });

    // If local database has enough results, return them immediately (Step 14)
    if (dbMatches.length >= 20) {
      console.log(`[SearchService] Cache hit: Found ${dbMatches.length} matches. Skipping Pexels API.`);
      
      const normalizedResults = dbMatches.map((doc) => ({
        id: doc.id,
        title: doc.name,
        image: doc.image,
        thumbnail: doc.thumbnails?.[0] || doc.image,
        photographer: doc.photographer || "Pexels Creator",
        photographerUrl: doc.photographerUrl || "",
        width: doc.width || 1920,
        height: doc.height || 1080,
        category: doc.category,
        alt: doc.description,
        source: "database"
      }));

      // Pagination slice
      const startIdx = (page - 1) * 20;
      return normalizedResults.slice(startIdx, startIdx + 20);
    }

    // Step 5 & 6: Fetch 50 images per query and merge
    console.log(`[SearchService] Cache miss. Fetching from Pexels API...`);
    let rawPhotos = [];
    for (const q of queries) {
      try {
        const photos = await PexelsService.searchPhotos(q, 50, page);
        rawPhotos = [...rawPhotos, ...photos];
      } catch (err) {
        console.warn(`[SearchService] Pexels query failed: "${q}":`, err.message);
      }
    }

    const totalFetched = rawPhotos.length;

    // Step 7: Remove duplicates
    const uniquePhotos = DuplicateService.deduplicate(rawPhotos);
    const duplicatesRemoved = totalFetched - uniquePhotos.length;

    // Step 9 & 10: Store in MongoDB & log in ImageCache
    const cachedDocs = await CacheService.cachePhotos(uniquePhotos, primaryQuery, cleanCategory);

    // Step 8: Normalize outputs
    const normalizedResults = cachedDocs.map((doc) => ({
      id: doc.id,
      title: doc.name,
      image: doc.image,
      thumbnail: doc.thumbnails?.[0] || doc.image,
      photographer: doc.photographer || "Pexels Creator",
      photographerUrl: doc.photographerUrl || "",
      width: doc.width || 1920,
      height: doc.height || 1080,
      category: doc.category,
      alt: doc.description,
      source: "pexels"
    }));

    const apiTime = Date.now() - startTime;

    // Step 16: Log Query, API Time, Images Returned, Duplicates Removed, Final Images
    console.log(`\n=================== SEARCH LOGS ===================`);
    console.log(`- Query: "${primaryQuery}"`);
    console.log(`- API Execution Time: ${apiTime}ms`);
    console.log(`- Raw Images Returned: ${totalFetched}`);
    console.log(`- Duplicates Removed: ${duplicatesRemoved}`);
    console.log(`- Final Unique Images: ${normalizedResults.length}`);
    console.log(`====================================================\n`);

    // Step 12: Return 20 images
    const startIdx = (page - 1) * 20;
    return normalizedResults.slice(startIdx, startIdx + 20);
  }
}

export default SearchService;
