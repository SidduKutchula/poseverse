import Pose from "../models/Pose.js";

export class ImageCacheService {
  static async cachePhotos(photos, category) {
    if (!Array.isArray(photos)) return [];

    const savedDocs = [];

    for (const photo of photos) {
      try {
        const photoId = photo.id.toString();
        const imageUrl = photo.src?.large || photo.url;
        const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

        const poseData = {
          id: photoId,
          name: photo.alt || "Photography Pose Inspiration",
          description: photo.alt || `Inspiration photography pose for ${category}.`,
          category: category.toLowerCase(),
          categoryLabel,
          difficulty: "Easy",
          peopleCount: "Couple",
          locationType: "Outdoor",
          style: "Candid",
          cameraAngle: "Eye level",
          image: imageUrl,
          imageVerified: true,
          thumbnails: [photo.src?.large, photo.src?.medium, photo.src?.small].filter(Boolean),
          trending: false,
        };

        // Do not store duplicates - Use upsert matching Pose schema
        const doc = await Pose.findOneAndUpdate(
          { id: photoId },
          poseData,
          { upsert: true, new: true, runValidators: true }
        );

        savedDocs.push(doc);
      } catch (err) {
        console.error(`Failed to cache photo ID ${photo?.id}:`, err.message);
      }
    }

    return savedDocs;
  }
}

export default ImageCacheService;
