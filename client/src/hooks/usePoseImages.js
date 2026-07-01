import { useMemo } from "react";
import { CATEGORY_COVERS, POSES } from "../data/poses";

const usePoseImages = (category, count = 5) => {
    const images = useMemo(() => {
        const poseImages = POSES.filter((pose) => pose.category === category)
            .flatMap((pose) => [pose.image, ...(pose.thumbnails || [])])
            .filter(Boolean);

        const fallback = CATEGORY_COVERS[category] || CATEGORY_COVERS.wedding;
        const source = poseImages.length > 0 ? poseImages : [fallback];

        return Array.from({ length: count }, (_, index) => source[index % source.length]);
    }, [category, count]);

    return { images, loading: false };
};

export default usePoseImages;