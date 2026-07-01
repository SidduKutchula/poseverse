import Pose from "../models/Pose.js";
import ImageCache from "../models/ImageCache.js";

export class CacheService {
  static async cachePhotos(photos, query, category) {
    if (!Array.isArray(photos)) return [];

    const savedDocs = [];

    for (const photo of photos) {
      try {
        const pexelsId = photo.id.toString();
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);
        const imageUrl = photo.src?.large || photo.url;

        // Normalization payload (Step 8)
        const poseData = {
          id: pexelsId,
          name: photo.alt || `${categoryLabel} Photography Pose`,
          description: photo.alt || `Beautiful photography pose reference for ${category}.`,
          category: category.toLowerCase(),
          categoryLabel,
          difficulty: "Easy",
          peopleCount: category.toLowerCase().includes("solo") ? "Solo" : "Couple",
          locationType: "Outdoor",
          style: "Candid",
          cameraAngle: "Eye level",
          image: imageUrl,
          imageVerified: true,
          thumbnails: [photo.src?.large, photo.src?.medium, photo.src?.small].filter(Boolean),
          trending: false,
          width: photo.width,
          height: photo.height,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url || photo.photographerUrl || ""
        };

        // Step 9: Store MongoDB via upsert
        const doc = await Pose.findOneAndUpdate(
          { id: pexelsId },
          poseData,
          { upsert: true, new: true, runValidators: true }
        );

        // Step 10: Log search parameters in ImageCache schema
        await ImageCache.findOneAndUpdate(
          { pexelsId },
          {
            pexelsId,
            query,
            category,
            lastAccessed: new Date()
          },
          { upsert: true }
        );

        savedDocs.push(doc);
      } catch (err) {
        console.error(`[CacheService] Failed to cache image ID ${photo?.id}:`, err.message);
      }
    }

    return savedDocs;
  }
}

export default CacheService;
