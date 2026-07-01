import { CATEGORY_COVERS, POSES } from "../data/poses";

export const FALLBACK_IMAGES = CATEGORY_COVERS;

export const fetchPoseImages = async (category, count = 5) => {
    const images = POSES.filter((pose) => pose.category === category)
        .flatMap((pose) => [pose.image, ...(pose.thumbnails || [])])
        .filter(Boolean);
    const fallback = CATEGORY_COVERS[category] || CATEGORY_COVERS.wedding;
    const source = images.length > 0 ? images : [fallback];

    return Array.from({ length: count }, (_, index) => source[index % source.length]);
};

export const fetchCategoryCovers = async () => CATEGORY_COVERS;