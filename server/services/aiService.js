import axios from "axios";

const HF_API_URL = "https://api-inference.huggingface.co/models";

const generateFallbackEmbedding = (text) => {
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

export const getCLIPTextEmbedding = async (text) => {
  const token = process.env.HF_ACCESS_TOKEN;
  if (!token || token === "" || token === "mock-key") {
    return generateFallbackEmbedding(text);
  }

  try {
    const response = await axios.post(
      `${HF_API_URL}/openai/clip-vit-large-patch14`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (Array.isArray(response.data) && Array.isArray(response.data[0])) {
      return response.data[0];
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn("HuggingFace CLIP Text Embedding failed, using fallback:", error.message);
  }
  return generateFallbackEmbedding(text);
};

export const getCLIPImageEmbedding = async (imageUrl) => {
  const token = process.env.HF_ACCESS_TOKEN;
  if (!token || token === "" || token === "mock-key") {
    return generateFallbackEmbedding(imageUrl);
  }

  try {
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(imgRes.data, "binary");

    const response = await axios.post(
      `${HF_API_URL}/openai/clip-vit-large-patch14`,
      buffer,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );
    if (Array.isArray(response.data) && Array.isArray(response.data[0])) {
      return response.data[0];
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    console.warn("HuggingFace CLIP Image Embedding failed, using fallback:", error.message);
  }
  return generateFallbackEmbedding(imageUrl);
};

export const generateBLIPCaption = async (imageUrl) => {
  const token = process.env.HF_ACCESS_TOKEN;
  if (!token || token === "" || token === "mock-key") {
    return "bride and groom holding hands while smiling at each other during sunset in a garden";
  }

  try {
    const imgRes = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(imgRes.data, "binary");

    const response = await axios.post(
      `${HF_API_URL}/Salesforce/blip2-opt-2.7b`,
      buffer,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    if (Array.isArray(response.data) && response.data[0]?.generated_text) {
      return response.data[0].generated_text.trim();
    }
  } catch (error) {
    console.warn("HuggingFace BLIP-2 Caption generation failed, using fallback:", error.message);
  }
  return "bride and groom holding hands while smiling at each other during sunset in a garden";
};
