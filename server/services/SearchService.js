import QueryBuilderService from "./QueryBuilderService.js";
import PexelsService from "./PexelsService.js";
import DuplicateRemovalService from "./DuplicateRemovalService.js";
import ImageCacheService from "./ImageCacheService.js";

export class SearchService {
  static async executeSearch({ category, filters = {}, page = 1 }) {
    if (!category) {
      throw new Error("Category parameter is required");
    }

    // Step 3 & 4: Build optimized query
    let optimizedQuery = QueryBuilderService.buildQuery(category, filters);
    
    // Step 5: Fetch 50 images per query
    let rawPhotos = [];
    try {
      rawPhotos = await PexelsService.searchPhotos(optimizedQuery, 50, page);
    } catch (error) {
      console.error("Primary Pexels query failed:", error.message);
    }

    // Step 6: Remove duplicates
    let uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);

    // Step 10: If less than 20 unique images are returned, automatically generate synonym queries
    let retryIndex = 0;
    while (uniquePhotos.length < 20 && retryIndex < 3) {
      const synonymQuery = QueryBuilderService.getSynonyms(category, retryIndex);
      console.log(`Fewer than 20 unique photos (${uniquePhotos.length}). Running synonym query: "${synonymQuery}"`);
      try {
        const retryPhotos = await PexelsService.searchPhotos(synonymQuery, 50, page);
        rawPhotos = [...rawPhotos, ...retryPhotos];
        uniquePhotos = DuplicateRemovalService.deduplicate(rawPhotos);
      } catch (err) {
        console.warn(`Synonym query failed: "${synonymQuery}"`, err.message);
      }
      retryIndex++;
    }

    // Step 8: Store unique images in MongoDB
    const cachedDocs = await ImageCacheService.cachePhotos(uniquePhotos, category);

    // Step 7: Normalize response output format
    const normalizedResults = cachedDocs.map((doc) => ({
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
      source: "pexels"
    }));

    // Step 9: Pagination - return a slice of 20 images
    // Since we fetched 50 items and deduplicated them, return top 20
    return normalizedResults.slice(0, 20);
  }
}

export default SearchService;
