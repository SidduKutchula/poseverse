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

const SYNONYMS = {
  wedding: ["indian wedding portrait", "wedding couple", "bride groom", "traditional marriage"],
  birthday: ["birthday celebration", "party portrait", "cutting cake"],
  "pre wedding": ["prewedding shoot", "outdoor romance", "couple lifestyle"],
  "baby shoot": ["baby portrait", "newborn photography", "infant shoot"],
  family: ["family picnic", "parenting portrait", "family generation"],
  travel: ["vacation pose", "adventurer lifestyle", "travel blogger"],
  fashion: ["model portfolio", "street style fashion", "studio model"],
  corporate: ["executive headshot", "office portrait", "professional business"],
  traditional: ["ethnic wear", "indian cultural costume", "traditional portrait"],
  festival: ["cultural festival celebrate", "festive clothing portrait"],
  graduation: ["graduated caps cap cap cap cap cap caps caps caps cap", "university graduation ceremony"],
  sports: ["athletic workout", "fitness model portrait"],
  friends: ["friends laughing outdoor", "lifestyle group portrait"],
  instagram: ["influencer street style", "modern aesthetic pose"],
  "solo male": ["men style portrait", "gentleman outdoor pose"],
  "solo female": ["women outdoor portrait", "elegant lady pose"],
  couple: ["lovers outdoor", "holding hands walk"],
  group: ["group gathering", "happy colleagues portrait"]
};

export class QueryBuilderService {
  static buildQuery(category, filters = {}) {
    const cleanCategory = (category || "").toLowerCase().trim();
    
    // Map base keywords
    let queryBase = CATEGORY_MAP[cleanCategory] || CATEGORY_MAP[cleanCategory.replace(/-/g, " ")] || `${cleanCategory} photography portrait`;

    // Append filter details if applicable
    const parts = [queryBase];
    if (filters.pose && !queryBase.includes(filters.pose.toLowerCase())) {
      parts.push(filters.pose);
    }
    if (filters.lighting && !queryBase.includes(filters.lighting.toLowerCase())) {
      parts.push(filters.lighting);
    }
    if (filters.background && !queryBase.includes(filters.background.toLowerCase())) {
      parts.push(filters.background);
    }

    return parts.join(" ").trim();
  }

  static getSynonyms(category, retryIndex = 0) {
    const cleanCategory = (category || "").toLowerCase().trim();
    const list = SYNONYMS[cleanCategory] || SYNONYMS[cleanCategory.replace(/-/g, " ")] || [`${cleanCategory} photography`];
    return list[retryIndex % list.length] || list[0];
  }
}

export default QueryBuilderService;
