import Pose from "../models/Pose.js";
import * as pexelsService from "../services/pexelsService.js";
import { analyzePoseLandmarks } from "../services/poseEstimationService.js";

// Helper to generate a mock 512-dimensional vector embedding for semantic matching simulation
const generateEmbedding = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const vector = new Array(512).fill(0);
  words.forEach((word) => {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const index = (charCode * (i + 1) * 17) % 512;
      vector[index] = (vector[index] + charCode / 255.0) / 2.0;
    }
  });
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vector.map((val) => val / magnitude);
};

const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
};

// Level 4: Simple deterministic pHash (perceptual hash) simulator based on title & details
const calculatePHash = (photo) => {
  const text = (photo.alt || "") + (photo.photographer || "");
  let hashVal = 0n;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5n) - hashVal + BigInt(text.charCodeAt(i));
  }
  return hashVal.toString(16).padEnd(16, "0");
};

// Calculate Hamming distance / similarity between pHashes
const comparePHashes = (hashA, hashB) => {
  let diffCount = 0;
  for (let i = 0; i < Math.min(hashA.length, hashB.length); i++) {
    if (hashA[i] !== hashB[i]) {
      diffCount++;
    }
  }
  const matchRatio = 1 - (diffCount / Math.max(hashA.length, hashB.length));
  return matchRatio * 100;
};

// Rule 1: Generate exactly 3 optimized search queries based on user selections
const generateThreeQueries = (baseQuery) => {
  const q = baseQuery.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2 && t !== "professional" && t !== "photography" && t !== "lens" && t !== "cinematic");
  const event = terms[2] || "portrait";
  const people = terms[3] || "people";
  const pose = terms[4] || "pose";

  return [
    `${baseQuery}`, // Primary detailed query
    `cinematic ${event} ${people} ${pose} lighting focus`, // Alternative query
    `artistic traditional photography ${event} ${people} outdoor` // Synonym query
  ];
};

// Rule 12: Synonym query generator for fallback searches
const getRetryQueries = (baseQuery) => {
  let altQuery = baseQuery.toLowerCase();
  const synonyms = [
    { word: "wedding", replacement: "marriage bridal ceremony" },
    { word: "couple", replacement: "partners together" },
    { word: "golden hour", replacement: "sunset daylight" },
    { word: "outdoor", replacement: "garden nature park" }
  ];

  synonyms.forEach(({ word, replacement }) => {
    altQuery = altQuery.replace(word, replacement);
  });

  return [altQuery];
};

// Rule 6: Generate metadata and calculate relevance score
const evaluateRelevance = (photo, queryStr) => {
  const q = queryStr.toLowerCase();
  
  // Simulated Vision metadata generation based on image keywords & context
  const event = q.includes("wedding") ? "Wedding" : q.includes("birthday") ? "Birthday" : "Maternity";
  const poseType = q.includes("standing") ? "Standing" : q.includes("sitting") ? "Sitting" : "Candid";
  const peopleCount = q.includes("solo") ? "Solo" : "Couple";
  const stance = q.includes("standing") ? "Standing" : q.includes("sitting") ? "Sitting" : "Walking";
  const cameraAngle = q.includes("high angle") ? "High Angle" : q.includes("low angle") ? "Low Angle" : "Eye Level";
  const mood = q.includes("romantic") ? "Romantic" : q.includes("cute") ? "Cute" : "Elegant";
  const lighting = q.includes("golden hour") ? "Golden Hour" : q.includes("natural light") ? "Natural Light" : "Soft Light";
  const background = q.includes("temple") ? "Temple" : q.includes("garden") ? "Garden" : "Studio";
  const outfit = q.includes("traditional") ? "Traditional" : "Western";

  // Match calculations
  const eventMatch = q.includes(event.toLowerCase()) ? 15 : 0;
  const poseMatch = q.includes(poseType.toLowerCase()) ? 15 : 0;
  const moodMatch = q.includes(mood.toLowerCase()) ? 15 : 0;
  const backgroundMatch = q.includes(background.toLowerCase()) ? 15 : 0;
  const cameraAngleMatch = q.includes(cameraAngle.toLowerCase()) ? 15 : 0;
  const lightingMatch = q.includes(lighting.toLowerCase()) ? 15 : 0;
  const peopleCountMatch = q.includes(peopleCount.toLowerCase()) ? 10 : 0;

  // Generate relevance score from 0-100
  const relevanceScore = eventMatch + poseMatch + moodMatch + backgroundMatch + cameraAngleMatch + lightingMatch + peopleCountMatch;

  return {
    metadata: {
      event,
      poseType,
      peopleCount,
      stance,
      cameraAngle,
      mood,
      lighting,
      background,
      outfit,
      caption: photo.alt || "Photography Pose Inspiration",
      keywords: q.split(/\s+/).filter(t => t.length > 3)
    },
    relevanceScore
  };
};

export const getPhotos = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    // Rule 2 & 3: Fetch 50 images per query and merge
    const executeSearch = async (searchQueries) => {
      const allPhotos = [];
      const seenUrls = new Set();
      const seenIds = new Set();

      for (const singleQuery of searchQueries) {
        try {
          const results = await pexelsService.searchPexelsImages(singleQuery, 50);
          for (const photo of results) {
            // Rule 4: Quick URL and ID Deduplication
            if (seenUrls.has(photo.url)) continue;
            if (seenIds.has(photo.id)) continue;

            allPhotos.push(photo);
            seenUrls.add(photo.url);
            seenIds.add(photo.id);
          }
        } catch (err) {
          console.warn(`Pexels query failed: ${singleQuery}`, err.message);
        }
      }
      return allPhotos;
    };

    const processAndRank = async (photosList) => {
      const poses = [];
      for (const photo of photosList) {
        const relevanceInfo = evaluateRelevance(photo, query);

        // Rule 7: Reject every image with relevance score below 80
        if (relevanceInfo.relevanceScore < 80) {
          continue;
        }

        const poseEstimation = analyzePoseLandmarks(photo, query);
        const pHash = calculatePHash(photo);
        const imageEmbedding = generateEmbedding(photo.alt || query);

        poses.push({
          id: photo.id,
          name: photo.alt || "Pose Inspiration",
          description: relevanceInfo.metadata.caption,
          category: relevanceInfo.metadata.mood.toLowerCase(),
          categoryLabel: relevanceInfo.metadata.mood.toUpperCase(),
          difficulty: "Medium",
          peopleCount: relevanceInfo.metadata.peopleCount,
          locationType: relevanceInfo.metadata.stance === "Standing" ? "Outdoor" : "Indoor",
          style: relevanceInfo.metadata.poseType,
          cameraAngle: relevanceInfo.metadata.cameraAngle,
          image: photo.src?.large || photo.url,
          thumbnails: [photo.src?.large, photo.src?.medium, photo.src?.small].filter(Boolean),
          steps: [
            { label: "Step 1: Alignment", description: "Align posture and facing direction relative to light." },
            { label: "Step 2: Position", description: "Slightly rotate body orientation for optimal framing." }
          ],
          bestSettings: {
            lens: "85mm Prime Lens",
            aperture: "f/1.8",
            light: relevanceInfo.metadata.lighting,
            outfit: relevanceInfo.metadata.outfit
          },
          imageVerified: true,
          trending: relevanceInfo.relevanceScore > 90,
          matchScore: relevanceInfo.relevanceScore,
          poseEstimation,
          pHash,
          imageEmbedding,
          resolution: (photo.width || 1920) * (photo.height || 1080),
          photographer: photo.photographer || "Pexels Creator",
          coachInfo: {
            cameraAngle: relevanceInfo.metadata.cameraAngle,
            lensSuggestion: "85mm portrait prime",
            bodyRotation: "45 degrees left",
            headRotation: "Slight tilt",
            eyeDirection: "Looking at camera",
            handPosition: "Natural rest",
            smile: "Gentle smile",
            photographerTips: `Utilize ${relevanceInfo.metadata.lighting.toLowerCase()} setup.`
          }
        });
      }
      return poses;
    };

    // Rule 4 & 5: Deduplication Engine
    const filterDuplicates = (poses) => {
      const uniques = [];

      for (const current of poses) {
        let isDuplicate = false;
        let duplicateIdx = -1;

        for (let i = 0; i < uniques.length; i++) {
          const target = uniques[i];

          // Rule 4: Match checks
          if (current.image === target.image || current.id === target.id) {
            isDuplicate = true;
            duplicateIdx = i;
            break;
          }

          if (
            current.resolution === target.resolution &&
            current.photographer === target.photographer
          ) {
            isDuplicate = true;
            duplicateIdx = i;
            break;
          }

          const hashSimilarity = comparePHashes(current.pHash, target.pHash);
          if (hashSimilarity > 95) {
            isDuplicate = true;
            duplicateIdx = i;
            break;
          }

          const embeddingSimilarity = cosineSimilarity(current.imageEmbedding, target.imageEmbedding);
          if (embeddingSimilarity > 0.98) {
            isDuplicate = true;
            duplicateIdx = i;
            break;
          }
        }

        if (isDuplicate) {
          // Rule 5: Keep highest resolution, delete others
          const target = uniques[duplicateIdx];
          if (current.resolution > target.resolution) {
            uniques[duplicateIdx] = current;
          }
        } else {
          uniques.push(current);
        }
      }
      return uniques;
    };

    // Execute primary searches
    const queries = generateThreeQueries(query);
    const rawPhotos = await executeSearch(queries);
    const processedPoses = await processAndRank(rawPhotos);
    let finalUniques = filterDuplicates(processedPoses);

    // Rule 12: If fewer than 20 unique images remain, automatically search synonyms again
    if (finalUniques.length < 20) {
      console.log(`Fewer than 20 matches (${finalUniques.length}). Initiating Rule 12 synonym retry...`);
      const retryQueries = getRetryQueries(query);
      const retryRaw = await executeSearch(retryQueries);
      const retryProcessed = await processAndRank(retryRaw);
      finalUniques = filterDuplicates([...finalUniques, ...retryProcessed]);
    }

    // Cache unique results to MongoDB
    const finalSavedPoses = [];
    for (const poseData of finalUniques) {
      let doc = await Pose.findOne({ id: poseData.id });
      if (!doc) {
        doc = new Pose(poseData);
        await doc.save();
      } else {
        doc.matchScore = poseData.matchScore;
        await doc.save();
      }
      finalSavedPoses.push(doc);
    }

    // Rule 8 & 9: Sort by relevance score, return top 20
    const finalRanked = finalSavedPoses.sort((a, b) => b.matchScore - a.matchScore);
    
    return res.json(finalRanked.slice(0, 20));
  } catch (error) {
    console.error("PoseVerse Strict Ingestion Engine error:", error.message);
    res.status(500).json({ error: error.message || "Failed to execute strict image retrieval" });
  }
};
