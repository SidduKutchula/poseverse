const CATEGORY_MAP = {
  wedding: "romantic indian wedding couple portrait photography standing full body",
  birthday: "birthday party celebration photography pose cake smiling",
  "pre wedding": "romantic pre-wedding couple photoshoot candid outdoor",
  "baby shoot": "cute baby photoshoot portrait photography",
  family: "happy family portrait photography outdoor smile",
  travel: "travel portrait lifestyle photography pose scenic",
  fashion: "fashion model pose photography studio catalog",
  corporate: "professional business corporate portrait corporate headshot",
  traditional: "traditional indian ethnic wear portrait photography",
  festival: "festival celebration photography portrait colorful",
  graduation: "graduation caps gown ceremony portrait photography",
  sports: "sports action photography athlete pose training",
  friends: "happy group of friends laughing photography portrait",
  instagram: "instagram reels influencer pose lifestyle travel",
  "solo male": "male portrait standing fashion photography street style",
  "solo female": "female portrait outdoor photography fashion model",
  couple: "romantic couple photography candid holding hands",
  group: "happy group portrait photography outdoor friendly"
};

export class QueryBuilderService {
  // Generate exactly 5 distinct optimized search queries (Step 1)
  static generateFiveQueries(category, filters = {}) {
    const cleanCategory = (category || "").toLowerCase().trim();
    const baseQuery = CATEGORY_MAP[cleanCategory] || `${cleanCategory} photography portrait`;

    const pose = filters.pose || "standing";
    const lighting = filters.lighting || "golden hour";
    const background = filters.background || "outdoor";
    const mood = filters.mood || "romantic";

    return [
      `${baseQuery} ${pose} ${lighting} ${background} ${mood}`, // Query 1: Detailed prompt
      `cinematic ${cleanCategory} photography ${pose} ${lighting}`, // Query 2: Aesthetic lighting variation
      `artistic ${cleanCategory} portrait pose ${background}`, // Query 3: Composition variation
      `professional portrait photography ${cleanCategory} ${mood}`, // Query 4: Mood variation
      `candid ${cleanCategory} style photography ${pose}` // Query 5: Natural lifestyle variation
    ];
  }

  static getSynonyms(category, retryIndex = 0) {
    const list = [
      `${category} portrait`,
      `${category} photoshoot`,
      `${category} ceremony`
    ];
    return list[retryIndex % list.length];
  }
}

export default QueryBuilderService;
