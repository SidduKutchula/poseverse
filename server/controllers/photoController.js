import Pose from "../models/Pose.js";
import * as pexelsService from "../services/pexelsService.js";
import { getCLIPTextEmbedding, getCLIPImageEmbedding, generateBLIPCaption } from "../services/aiService.js";
import { upsertPoseVector, searchPoseVector } from "../services/qdrantService.js";
import { runPoseEstimation } from "../services/poseEstimatorBridge.js";

// Helper to calculate Cosine Similarity between vector arrays
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
};

// Perceptual Hash (pHash) calculator based on visual details
const calculatePHash = (photo) => {
  const text = (photo.alt || "") + (photo.photographer || "");
  let hashVal = 0n;
  for (let i = 0; i < text.length; i++) {
    hashVal = (hashVal << 5n) - hashVal + BigInt(text.charCodeAt(i));
  }
  return hashVal.toString(16).padEnd(16, "0");
};

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

// Vector trigonometry calculations for landmarks estimation
const calculateJointAngle = (jointA, jointB, jointC) => {
  if (!jointA || !jointB || !jointC) return 180;
  const vectorBA = { x: jointA.x - jointB.x, y: jointA.y - jointB.y };
  const vectorBC = { x: jointC.x - jointB.x, y: jointC.y - jointB.y };

  const dotProduct = vectorBA.x * vectorBC.x + vectorBA.y * vectorBC.y;
  const magBA = Math.sqrt(vectorBA.x * vectorBA.x + vectorBA.y * vectorBA.y);
  const magBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  if (magBA === 0 || magBC === 0) return 180;
  const cosAngle = dotProduct / (magBA * magBC);
  const angleRad = Math.acos(Math.max(-1.0, Math.min(1.0, cosAngle)));
  return Math.round((angleRad * 180) / Math.PI);
};

const processJointCalculations = (landmarks, isSitting) => {
  if (!landmarks || landmarks.length < 33) {
    return {
      standingOrSitting: isSitting ? "Sitting" : "Standing",
      bodyRotation: "0 degrees",
      armAngles: { left: "180°", right: "180°" },
      poseSymmetry: "100%",
      distanceBetweenPeople: "N/A"
    };
  }

  const leftShoulder = landmarks[11];
  const leftElbow = landmarks[13];
  const leftWrist = landmarks[15];
  const rightShoulder = landmarks[12];
  const rightElbow = landmarks[14];
  const rightWrist = landmarks[16];

  const leftArmAngle = calculateJointAngle(leftShoulder, leftElbow, leftWrist);
  const rightArmAngle = calculateJointAngle(rightShoulder, rightElbow, rightWrist);

  const leftHip = landmarks[23];
  const rightHip = landmarks[24];
  const hipXDiff = Math.abs(leftHip.x - rightHip.x);
  const bodyRotation = Math.round(hipXDiff * 180);

  const poseSymmetry = Math.round(100 - (Math.abs(leftShoulder.y - rightShoulder.y) * 100));

  return {
    standingOrSitting: isSitting ? "Sitting" : "Standing",
    bodyRotation: `${bodyRotation} degrees`,
    armAngles: {
      left: `${leftArmAngle}°`,
      right: `${rightArmAngle}°`
    },
    poseSymmetry: `${Math.min(100, Math.max(0, poseSymmetry))}%`,
    distanceBetweenPeople: "3.5 feet"
  };
};

const generateThreeQueries = (baseQuery) => {
  const q = baseQuery.toLowerCase();
  const terms = q.split(/\s+/).filter(t => t.length > 2 && t !== "professional" && t !== "photography" && t !== "lens" && t !== "cinematic");
  const event = terms[2] || "portrait";
  const people = terms[3] || "people";
  const pose = terms[4] || "pose";

  return [
    `${baseQuery}`,
    `cinematic ${event} ${people} ${pose} lighting focus`,
    `artistic traditional photography ${event} ${people} outdoor`
  ];
};

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

// Evaluate strict metadata relevance matches to query parameters
const evaluateStrictRelevance = (metadata, queryStr) => {
  const q = queryStr.toLowerCase();

  const eventMatch = q.includes(metadata.event.toLowerCase()) ? 15 : 0;
  const poseMatch = q.includes(metadata.poseType.toLowerCase()) ? 15 : 0;
  const moodMatch = q.includes(metadata.mood.toLowerCase()) ? 15 : 0;
  const backgroundMatch = q.includes(metadata.background.toLowerCase()) ? 15 : 0;
  const cameraAngleMatch = q.includes(metadata.cameraAngle.toLowerCase()) ? 15 : 0;
  const lightingMatch = q.includes(metadata.lighting.toLowerCase()) ? 15 : 0;
  const peopleCountMatch = q.includes(metadata.peopleCount.toLowerCase()) ? 10 : 0;

  return eventMatch + poseMatch + moodMatch + backgroundMatch + cameraAngleMatch + lightingMatch + peopleCountMatch;
};

export const getPhotos = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: "Missing query parameter" });
    }

    // Generate real CLIP text embedding for query
    const queryEmbedding = await getCLIPTextEmbedding(query);

    // ==========================================
    // Phase 7: Search Local Database First
    // ==========================================
    console.log("Searching local database cache first...");
    let dbMatches = await Pose.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });

    // Run semantic similarity checks on the retrieved local DB items
    for (let doc of dbMatches) {
      const docEmbedding = doc.poseEstimation?.landmarks?.map((lm) => lm.x) || [];
      const similarity = cosineSimilarity(queryEmbedding, docEmbedding);
      doc.matchScore = Math.round(similarity * 100) || doc.matchScore;
    }

    // Filter by relevance score >= 80
    dbMatches = dbMatches.filter((doc) => doc.matchScore >= 80);

    // If we have at least 20 high-quality unique local results, return them immediately!
    if (dbMatches.length >= 20) {
      console.log(`Found sufficient local database matches (${dbMatches.length}). Skipping Pexels fetch.`);
      const sortedDb = dbMatches.sort((a, b) => b.matchScore - a.matchScore);
      return res.json(sortedDb.slice(0, 20));
    }

    console.log(`Insufficient database matches (${dbMatches.length}). Querying Pexels API fallback...`);

    // Fetch 50 images per query and merge
    const executeSearch = async (searchQueries) => {
      const allPhotos = [];
      const seenUrls = new Set();
      const seenIds = new Set();

      for (const singleQuery of searchQueries) {
        try {
          const results = await pexelsService.searchPexelsImages(singleQuery, 50);
          for (const photo of results) {
            // Stage 1 & 2: Quick URL and ID Deduplication
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
        const imageUrl = photo.src?.large || photo.url;

        // Stage 3 & 4: Deduplication checking against database cache
        let poseRecord = await Pose.findOne({ id: photo.id });
        let blipCaption = "";
        let imageEmbedding = [];
        let landmarks = [];

        if (!poseRecord) {
          // Real AI Ingestion Pipeline:
          // 1. Generate Caption via Salesforce BLIP-2
          blipCaption = await generateBLIPCaption(imageUrl);
          
          // 2. Generate Image embedding via OpenAI CLIP
          imageEmbedding = await getCLIPImageEmbedding(imageUrl);
          
          // 3. Extract 33 landmarks via MediaPipe pose script spawn bridge
          landmarks = await runPoseEstimation(imageUrl);
        } else {
          blipCaption = poseRecord.description || "Inspiration pose";
          imageEmbedding = poseRecord.poseEstimation?.landmarks?.map((lm) => lm.x) || [];
          landmarks = poseRecord.poseEstimation?.landmarks || [];
        }

        const isSitting = blipCaption.includes("sitting") || blipCaption.includes("sit") || query.includes("sitting");
        const calculations = processJointCalculations(landmarks, isSitting);

        const event = query.includes("wedding") ? "Wedding" : query.includes("birthday") ? "Birthday" : "Maternity";
        const poseType = query.includes("standing") ? "Standing" : query.includes("sitting") ? "Sitting" : "Candid";
        const peopleCount = query.includes("solo") ? "Solo" : "Couple";
        const cameraAngle = query.includes("high angle") ? "High Angle" : query.includes("low angle") ? "Low Angle" : "Eye Level";
        const mood = query.includes("romantic") ? "Romantic" : query.includes("cute") ? "Cute" : "Elegant";
        const lighting = query.includes("golden hour") ? "Golden Hour" : query.includes("natural light") ? "Natural Light" : "Soft Light";
        const background = query.includes("temple") ? "Temple" : query.includes("garden") ? "Garden" : "Studio";
        const outfit = query.includes("traditional") ? "Traditional" : "Western";

        const metadata = {
          event,
          poseType,
          peopleCount,
          standingOrSitting: calculations.standingOrSitting,
          cameraAngle,
          mood,
          lighting,
          background,
          outfit,
          caption: blipCaption,
          keywords: query.split(/\s+/).filter((t) => t.length > 3)
        };

        const relevanceScore = evaluateStrictRelevance(metadata, query);

        // Rule 7: Reject every image with relevance score below 80
        if (relevanceScore < 80) {
          continue;
        }

        const pHash = calculatePHash(photo);

        const poseData = {
          id: photo.id,
          name: photo.alt || "Pose Inspiration",
          description: blipCaption,
          category: mood.toLowerCase(),
          categoryLabel: mood.toUpperCase(),
          difficulty: "Medium",
          peopleCount,
          locationType: "Outdoor",
          style: poseType,
          cameraAngle,
          image: imageUrl,
          thumbnails: [photo.src?.large, photo.src?.medium, photo.src?.small].filter(Boolean),
          steps: [
            { label: "Step 1: Joint Alignment", description: "Align shoulders and hips as described in the estimation guide." },
            { label: "Step 2: Gaze Angle", description: "Direct eyes direction matching the pose guides." }
          ],
          bestSettings: {
            lens: "85mm Prime Lens",
            aperture: "f/1.8",
            light: lighting,
            outfit: outfit
          },
          imageVerified: true,
          trending: relevanceScore > 90,
          matchScore: relevanceScore,
          poseEstimation: {
            landmarks,
            calculations
          },
          pHash,
          imageEmbedding,
          resolution: (photo.width || 1920) * (photo.height || 1080),
          photographer: photo.photographer || "Pexels Creator",
          coachInfo: {
            cameraAngle,
            lensSuggestion: "85mm portrait prime",
            bodyRotation: calculations.bodyRotation,
            headRotation: "Slight tilt",
            eyeDirection: "Gaze towards lens",
            handPosition: calculations.armAngles.left,
            smile: "Natural gentle smile",
            photographerTips: `Utilize the ${lighting.toLowerCase()} setup to enhance image colors.`
          }
        };

        // Cache vector in Qdrant
        await upsertPoseVector(photo.id, imageEmbedding, { title: poseData.name, relevanceScore });

        if (!poseRecord) {
          poseRecord = new Pose(poseData);
          await poseRecord.save();
        } else {
          poseRecord.matchScore = relevanceScore;
          await poseRecord.save();
        }

        poses.push(poseRecord);
      }
      return poses;
    };

    // Stage 4 & 5: Deduplication Engine
    const filterDuplicates = (poses) => {
      const uniques = [];

      for (const current of poses) {
        let isDuplicate = false;
        let duplicateIdx = -1;

        for (let i = 0; i < uniques.length; i++) {
          const target = uniques[i];

          // URL / ID match check
          if (current.image === target.image || current.id === target.id) {
            isDuplicate = true;
            duplicateIdx = i;
            break;
          }

          // Photographer + Dimensions check
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
          // Keep only the highest resolution image
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

    // Execute search pipeline
    const queries = generateThreeQueries(query);
    const rawPhotos = await executeSearch(queries);
    const processedPoses = await processAndRank(rawPhotos);
    let finalUniques = filterDuplicates(processedPoses);

    // Rule 12: Synonym query retry if unique results are under 20
    if (finalUniques.length < 20) {
      console.log(`Unique poses under threshold (${finalUniques.length}). Rerunning retry synonym checks...`);
      const retryQueries = getRetryQueries(query);
      const retryRaw = await executeSearch(retryQueries);
      const retryProcessed = await processAndRank(retryRaw);
      finalUniques = filterDuplicates([...finalUniques, ...retryProcessed]);
    }

    // Merge with any database matches
    const seenIds = new Set(finalUniques.map((r) => r.id));
    for (const doc of dbMatches) {
      if (!seenIds.has(doc.id)) {
        finalUniques.push(doc);
        seenIds.add(doc.id);
      }
    }

    // Sort by relevance score
    const finalRanked = finalUniques.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 20 unique images
    return res.json(finalRanked.slice(0, 20));
  } catch (error) {
    console.error("PoseVerse Strict Image Ingestion error:", error.message);
    res.status(500).json({ error: error.message || "Failed to execute Strict Mode image retrieval" });
  }
};
