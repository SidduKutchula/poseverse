import axios from "axios";
import { POSES } from "../../client/src/data/poses.js";

const PEXELS_API_URL = "https://api.pexels.com/v1/search";

export const searchPexelsImages = async (query, count = 12) => {
  const pexelsKey = process.env.PEXELS_API_KEY;

  if (!pexelsKey || pexelsKey === "mock-key" || pexelsKey === "") {
    console.log(`Using offline local mock fallback for Pexels search query: "${query}"`);
    // Filter local POSES matching query keywords as best as possible
    const queryTerms = query.toLowerCase().split(/\s+/);
    let matched = POSES.filter((pose) => {
      const nameMatch = queryTerms.some((term) => pose.name.toLowerCase().includes(term));
      const catMatch = queryTerms.some((term) => pose.category.toLowerCase().includes(term));
      const tagMatch = pose.tags?.some((tag) => queryTerms.some((term) => tag.toLowerCase().includes(term)));
      return nameMatch || catMatch || tagMatch;
    });

    if (matched.length === 0) {
      matched = POSES;
    }

    return matched.slice(0, count).map((pose, index) => ({
      id: `pexels_mock_${pose.id}_${index}`,
      url: pose.image,
      src: {
        original: pose.image,
        large: pose.image,
        medium: pose.image,
        small: pose.image,
      },
      photographer: "PoseVerse Creator",
      alt: pose.name,
      metadata: generateMockMetadata(pose, query),
    }));
  }

  try {
    const response = await axios.get(`${PEXELS_API_URL}?query=${encodeURIComponent(query)}&per_page=${count}`, {
      headers: {
        Authorization: pexelsKey,
      },
    });

    const photos = response.data.photos || [];
    return photos.map((photo) => ({
      id: photo.id.toString(),
      url: photo.url,
      src: photo.src,
      photographer: photo.photographer,
      alt: photo.alt || query,
      metadata: generateMockMetadata(photo, query),
    }));
  } catch (error) {
    console.error("Pexels API Error, falling back to local simulation:", error.message);
    return POSES.slice(0, count).map((pose, index) => ({
      id: `pexels_error_fallback_${pose.id}_${index}`,
      url: pose.image,
      src: {
        original: pose.image,
        large: pose.image,
        medium: pose.image,
        small: pose.image,
      },
      photographer: "Pexels Fallback",
      alt: pose.name,
      metadata: generateMockMetadata(pose, query),
    }));
  }
};

const generateMockMetadata = (source, query) => {
  const q = query.toLowerCase();
  
  // Categorize based on query keywords
  let category = "wedding";
  if (q.includes("birthday")) category = "birthday";
  else if (q.includes("family")) category = "family";
  else if (q.includes("baby") || q.includes("kids")) category = "baby";
  else if (q.includes("maternity")) category = "maternity";
  else if (q.includes("travel")) category = "travel";
  else if (q.includes("fashion")) category = "fashion";
  else if (q.includes("reels")) category = "reels";
  
  // Parse People Count
  let peopleCount = "Couple";
  if (q.includes("solo") || q.includes("bride") || q.includes("groom")) peopleCount = "Solo";
  else if (q.includes("group") || q.includes("friends") || q.includes("family")) peopleCount = "Group";

  // Parse Style
  let isTraditional = q.includes("traditional") || q.includes("indian") || q.includes("ethnic");
  let isModern = !isTraditional;

  // Mood
  let mood = "Romantic";
  if (q.includes("happy") || q.includes("birthday")) mood = "Happy";
  else if (q.includes("cute") || q.includes("baby")) mood = "Cute";
  else if (q.includes("elegant") || q.includes("fashion")) mood = "Elegant";

  return {
    title: source.name || source.alt || "Stunning Photo Inspiration",
    category,
    pose: q.includes("standing") ? "Standing" : q.includes("sitting") ? "Sitting" : "Candid",
    mood,
    peopleCount,
    cameraAngle: q.includes("drone") ? "Drone" : q.includes("close up") ? "Close Up" : "Eye Level",
    lighting: q.includes("golden hour") ? "Golden Hour" : q.includes("night") ? "Night" : "Natural",
    bodyDirection: "Facing 45 Degrees",
    handPosition: q.includes("holding hands") ? "Holding Hands" : "Natural Rest",
    indoor: q.includes("indoor"),
    outdoor: !q.includes("indoor"),
    traditional: isTraditional,
    modern: isModern,
    portrait: true,
    landscape: false,
    keywords: q.split(/\s+/).filter((k) => k.length > 3),
    description: `Perfect ${category} inspiration featuring a ${mood.toLowerCase()} setup, ideal for photographers wanting a ${isTraditional ? "traditional" : "modern"} look.`,
  };
};
