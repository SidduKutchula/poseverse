import express from "express";
import axios from "axios";
import { POSES } from "../../client/src/data/poses.js";

const router = express.Router();

// Fallback logic to generate 12 poses from local verified dataset
const getLocalFallback = (occasion, people, style) => {
  // Only suggest verified poses
  let filtered = POSES.filter((p) => p.imageVerified);

  if (occasion) {
    const occasionLower = occasion.toLowerCase();
    const matches = filtered.filter(
      (p) => p.category.toLowerCase() === occasionLower
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  if (people && people !== "Any") {
    const peopleLower = people.toLowerCase();
    const matches = filtered.filter(
      (p) => p.peopleCount && p.peopleCount.toLowerCase() === peopleLower
    );
    if (matches.length > 0) {
      filtered = matches;
    }
  }

  const results = filtered.slice(0, 12).map((p, idx) => {
    const matchScore = 85 + Math.min(idx * 2, 13);
    return {
      ...p,
      _id: p.id || `mock_pose_${idx + 1}`,
      matchScore,
    };
  });

  // Pad to exactly 12 poses using verified ones
  const verifiedPoses = POSES.filter((p) => p.imageVerified);
  while (results.length < 12 && verifiedPoses.length > 0) {
    const padPose = verifiedPoses[results.length % verifiedPoses.length];
    results.push({
      ...padPose,
      _id: `${padPose.id}_pad_${results.length}`,
      matchScore: 85 + Math.min(results.length * 2, 13),
    });
  }

  return results;
};

router.post("/recommend", async (req, res) => {
  const { occasion, location, people, style, experience, timeOfDay } = req.body;

  const apiKey = process.env.OPENAI_API_KEY;

  // Filter to verified poses first
  const verifiedPoses = POSES.filter((p) => p.imageVerified);

  // If no OpenAI key is configured or verified dataset is empty, fallback to local matching
  if (!apiKey || apiKey === "mock-key" || apiKey === "" || verifiedPoses.length === 0) {
    console.log("Using local recommendation engine (No OpenAI API key or verified poses)...");
    const fallbackResults = getLocalFallback(occasion, people, style);
    return res.json({ poses: fallbackResults });
  }

  // System instructions restricting choices to verified list
  const systemPrompt = `You are a photography director. You may ONLY recommend poses from this exact list — do not invent new poses or descriptions. Return their "id" field exactly as given, plus a matchScore (85-98) and a one-line reason. Return ONLY valid JSON, no markdown.
  Available poses: ${JSON.stringify(
    verifiedPoses.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      tags: p.tags,
      difficulty: p.difficulty,
    }))
  )}`;

  const userPrompt = `
Generate exactly 12 photography pose recommendations from the available poses list for the following parameters:
- Occasion: ${occasion || "Any"}
- Location: ${location || "Outdoor"}
- People (Subject count): ${people || "Couple"}
- Shooting Style: ${style || "Cinematic"}
- Subject Experience: ${experience || "First time"}
- Time of Day / Timing: ${timeOfDay || "Golden Hour"}

Return a JSON object in this format (do not use markdown wrapping):
{
  "picks": [
    { "id": "Pose ID from the list", "matchScore": 95, "reason": "Reason for match" }
  ]
}
`;

  try {
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    let text = aiResponse.data.choices[0].message.content.trim();
    
    // Clean potential markdown wrap
    if (text.startsWith("```")) {
      text = text.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const aiData = JSON.parse(text);
    const picks = aiData.picks || [];

    // Map AI's chosen ids back to the full verified local pose objects
    const mappedPoses = picks
      .map((pick) => {
        const pose = verifiedPoses.find((p) => p.id === pick.id);
        if (pose) {
          return {
            ...pose,
            _id: pose.id,
            matchScore: pick.matchScore || 85,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Ensure we have exactly 12 suggestions returned to the frontend
    const results = [...mappedPoses];
    while (results.length < 12 && verifiedPoses.length > 0) {
      const padPose = verifiedPoses[results.length % verifiedPoses.length];
      results.push({
        ...padPose,
        _id: `${padPose.id}_pad_${results.length}`,
        matchScore: 85 + Math.min(results.length * 2, 13),
      });
    }

    res.json({ poses: results });
  } catch (error) {
    console.error("OpenAI recommend error:", error.response?.data || error.message);
    console.log("Falling back to local recommendation algorithm...");
    const fallbackResults = getLocalFallback(occasion, people, style);
    res.json({ poses: fallbackResults });
  }
});

export default router;
