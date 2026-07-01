import axios from "axios";

const PEXELS_URL = "https://api.pexels.com/v1/search";

export class PexelsService {
  static async searchPhotos(query, perPage = 50, page = 1) {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey || apiKey === "mock-key") {
      throw new Error("PEXELS_API_KEY is not configured on the server");
    }

    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        console.log(`Executing real Pexels API fetch for query: "${query}", page ${page}`);
        const response = await axios.get(PEXELS_URL, {
          headers: {
            Authorization: apiKey,
          },
          params: {
            query,
            per_page: perPage,
            page,
          },
          timeout: 10000, // 10 seconds timeout
        });

        return response.data.photos || [];
      } catch (error) {
        retries--;
        const status = error.response?.status;
        console.warn(`Pexels API request failed (Status: ${status || "Timeout"}). Retries remaining: ${retries}`);

        if (retries === 0) {
          throw new Error(error.response?.data?.error || error.message || "Failed to contact Pexels API");
        }

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
}

export default PexelsService;
