import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL || "http://localhost:6333";
let client = null;
let isQdrantActive = false;

const COLLECTION_NAME = "poses";

// Local in-memory vector index fallback
const localVectorStore = [];

export const initQdrant = async () => {
  try {
    client = new QdrantClient({ url: QDRANT_URL });
    const collections = await client.getCollections();
    const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);
    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: { size: 512, distance: "Cosine" },
      });
    }
    isQdrantActive = true;
    console.log(`Qdrant vector engine initialized on ${QDRANT_URL}`);
  } catch (error) {
    console.warn("Qdrant connection failed. Using local in-memory cosine similarity engine:", error.message);
    isQdrantActive = false;
  }
};

// UUID helper to fit Qdrant point specifications (expects integer or standard UUID string)
const formatPointId = (idStr) => {
  // Convert standard Pexels numeric IDs or pose IDs to valid UUIDs or clean numbers
  const cleaned = idStr.replace(/[^0-9]/g, "");
  return cleaned ? parseInt(cleaned.slice(0, 15)) : Date.now();
};

export const upsertPoseVector = async (poseId, embedding, payload = {}) => {
  if (isQdrantActive && client) {
    try {
      const pointId = formatPointId(poseId);
      await client.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id: pointId,
            vector: embedding,
            payload: { ...payload, poseId },
          },
        ],
      });
      return;
    } catch (err) {
      console.warn("Upserting vector to Qdrant failed, indexing in local fallback:", err.message);
    }
  }

  // Fallback to local memory vector database
  const index = localVectorStore.findIndex((item) => item.poseId === poseId);
  const entry = { poseId, vector: embedding, payload };
  if (index !== -1) {
    localVectorStore[index] = entry;
  } else {
    localVectorStore.push(entry);
  }
};

export const searchPoseVector = async (queryEmbedding, limit = 20) => {
  if (isQdrantActive && client) {
    try {
      const results = await client.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit,
        with_payload: true,
      });
      return results.map((item) => ({
        poseId: item.payload?.poseId || item.id.toString(),
        score: item.score,
        payload: item.payload,
      }));
    } catch (err) {
      console.warn("Search vector in Qdrant failed, using local index fallback:", err.message);
    }
  }

  // Calculate local Cosine Similarity
  const results = localVectorStore.map((item) => {
    let dotProduct = 0;
    for (let i = 0; i < queryEmbedding.length; i++) {
      dotProduct += queryEmbedding[i] * item.vector[i];
    }
    return {
      poseId: item.poseId,
      score: dotProduct,
      payload: item.payload,
    };
  });

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
};
