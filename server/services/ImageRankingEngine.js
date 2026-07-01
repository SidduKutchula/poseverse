const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
};

export class ImageRankingEngine {
  static rank(poses, queryEmbedding, queryText) {
    const q = (queryText || "").toLowerCase();

    return poses.map((pose) => {
      // 40% Caption Similarity (using CLIP text vs image embedding cosine similarity)
      const captionSim = cosineSimilarity(queryEmbedding, pose.imageEmbedding || []);
      const captionScore = captionSim * 40;

      // 20% Category Match
      const categoryMatch = q.includes((pose.category || "").toLowerCase()) ? 20 : 0;

      // 15% Pose Match
      const poseMatch = q.includes((pose.style || "").toLowerCase()) ? 15 : 0;

      // 10% People Count
      const peopleMatch = q.includes((pose.peopleCount || "").toLowerCase()) ? 10 : 0;

      // 10% Background Match
      const backgroundMatch = q.includes((pose.locationType || "").toLowerCase()) ? 10 : 0;

      // 5% Popularity (simulated out of 5 based on photographer string length or fixed metric)
      const popularityScore = 5;

      const totalScore = Math.round(
        captionScore + categoryMatch + poseMatch + peopleMatch + backgroundMatch + popularityScore
      );

      return {
        ...pose.toObject ? pose.toObject() : pose,
        matchScore: totalScore
      };
    });
  }
}

export default ImageRankingEngine;
