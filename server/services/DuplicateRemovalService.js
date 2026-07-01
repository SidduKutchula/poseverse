export class DuplicateRemovalService {
  static deduplicate(photos) {
    if (!Array.isArray(photos)) return [];

    const uniques = [];
    const seenIds = new Set();
    const seenOrigUrls = new Set();
    const seenLargeUrls = new Set();

    for (const photo of photos) {
      if (!photo) continue;

      const photoId = photo.id?.toString();
      const origUrl = photo.src?.original || photo.url;
      const largeUrl = photo.src?.large || photo.src?.original || photo.url;
      const photographer = (photo.photographer || "").trim().toLowerCase();
      const width = parseInt(photo.width) || 0;
      const height = parseInt(photo.height) || 0;
      const resolution = width * height;

      // Duplicate Rules:
      // Same ID -> Remove
      if (seenIds.has(photoId)) continue;

      // Same Original URL -> Remove
      if (seenOrigUrls.has(origUrl)) continue;

      // Same Large Image URL -> Remove
      if (seenLargeUrls.has(largeUrl)) continue;

      // Same Photographer AND Dimensions -> Keep highest resolution
      let isSameCreatorAndDim = false;
      let duplicateIdx = -1;

      for (let i = 0; i < uniques.length; i++) {
        const u = uniques[i];
        const uPhotographer = (u.photographer || "").trim().toLowerCase();
        const uWidth = parseInt(u.width) || 0;
        const uHeight = parseInt(u.height) || 0;

        if (
          uPhotographer === photographer &&
          uWidth === width &&
          uHeight === height
        ) {
          isSameCreatorAndDim = true;
          duplicateIdx = i;
          break;
        }
      }

      if (isSameCreatorAndDim) {
        const target = uniques[duplicateIdx];
        const targetRes = (parseInt(target.width) || 0) * (parseInt(target.height) || 0);
        if (resolution > targetRes) {
          // Replace with higher resolution copy
          uniques[duplicateIdx] = photo;
        }
      } else {
        uniques.push(photo);
        seenIds.add(photoId);
        seenOrigUrls.add(origUrl);
        seenLargeUrls.add(largeUrl);
      }
    }

    return uniques;
  }
}

export default DuplicateRemovalService;
