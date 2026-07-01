export class DuplicateService {
  static deduplicate(photos) {
    if (!Array.isArray(photos)) return [];

    const uniques = [];
    const seenIds = new Set();
    const seenOrigUrls = new Set();
    const seenLargeUrls = new Set();

    for (const photo of photos) {
      if (!photo) continue;

      const pexelsId = photo.id?.toString();
      const origUrl = photo.src?.original || photo.url;
      const largeUrl = photo.src?.large || photo.src?.original || photo.url;
      const photographer = (photo.photographer || "").trim().toLowerCase();
      const width = parseInt(photo.width) || 0;
      const height = parseInt(photo.height) || 0;

      // Duplicate Rules (Step 7)
      if (seenIds.has(pexelsId)) continue;
      if (seenOrigUrls.has(origUrl)) continue;
      if (seenLargeUrls.has(largeUrl)) continue;

      let isDuplicateByMeta = false;
      for (const u of uniques) {
        const uPhotographer = (u.photographer || "").trim().toLowerCase();
        const uWidth = parseInt(u.width) || 0;
        const uHeight = parseInt(u.height) || 0;

        if (
          uPhotographer === photographer &&
          uWidth === width &&
          uHeight === height
        ) {
          isDuplicateByMeta = true;
          break;
        }
      }

      if (isDuplicateByMeta) continue;

      uniques.push(photo);
      seenIds.add(pexelsId);
      seenOrigUrls.add(origUrl);
      seenLargeUrls.add(largeUrl);
    }

    return uniques;
  }
}

export default DuplicateService;
