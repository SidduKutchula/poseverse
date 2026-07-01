import { POSES, CATEGORIES } from "../../client/src/data/poses.js";

export function validatePoses() {
  const errors = [];
  const validCategories = CATEGORIES.map(c => c.slug);

  POSES.forEach(pose => {
    if (!validCategories.includes(pose.category)) {
      errors.push(`${pose.id}: category "${pose.category}" not in CATEGORIES`);
    }
    if (!pose.image) {
      errors.push(`${pose.id}: missing image field`);
    }
    if (pose.imageVerified && (!pose.thumbnails || pose.thumbnails.length < 3)) {
      errors.push(`${pose.id}: verified but missing 3 thumbnails`);
    }
    if (pose.imageVerified && (!pose.steps || pose.steps.length !== 6)) {
      errors.push(`${pose.id}: verified but steps count != 6`);
    }
    if (!pose.tags || pose.tags.length === 0) {
      errors.push(`${pose.id}: missing tags`);
    }
    // Tag/category alignment — first tag should match categoryLabel or similar
    if (pose.tags && !pose.tags.includes(pose.categoryLabel)) {
      errors.push(`${pose.id}: tags don't include categoryLabel "${pose.categoryLabel}"`);
    }
  });

  if (errors.length) {
    console.error("❌ Pose data validation failed:\n" + errors.join("\n"));
    process.exit(1);
  }
  
  const verifiedCount = POSES.filter(p => p.imageVerified).length;
  console.log(`✅ ${POSES.length} poses successfully validated. ${verifiedCount} poses have verified images.`);
}

// Allow direct execution or module import
if (process.argv[1] && process.argv[1].endsWith("validatePoses.js")) {
  validatePoses();
}
