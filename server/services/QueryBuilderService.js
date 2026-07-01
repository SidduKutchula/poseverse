const CATEGORY_MAP = {
  wedding: "romantic indian wedding couple standing portrait photography",
  birthday: "birthday celebration portrait photography cake cutting",
  "solo male": "male portrait standing fashion photography outdoor",
  "solo female": "female portrait photography outdoor smiling",
  family: "happy family portrait photography outdoor",
  travel: "travel portrait photography mountains sunset",
  baby: "baby portrait photography smiling",
  traditional: "traditional indian portrait photography",
  corporate: "professional business portrait photography",
  fashion: "fashion model photography portrait",
  festival: "festival traditional portrait photography",
  couple: "romantic couple photography portrait candid",
  group: "happy group portrait photography outdoor friendly"
};

export class QueryBuilderService {
  // Map category to optimized queries (Step 2 & 3)
  static generateThreeQueries(category) {
    const cleanCategory = (category || "").toLowerCase().trim();
    const baseQuery = CATEGORY_MAP[cleanCategory] || `${cleanCategory} photography portrait`;

    // Extract terms for synonym queries
    const terms = cleanCategory.split(/\s+/);
    const mainSubject = terms[terms.length - 1] || "couple";

    return [
      baseQuery, // Query 1: Primary detailed photography query
      `traditional ${cleanCategory} couple portrait photography`, // Query 2: Traditional portrait variation
      `candid ${cleanCategory} photography pose focus` // Query 3: Candid style variation
    ];
  }
}

export default QueryBuilderService;
