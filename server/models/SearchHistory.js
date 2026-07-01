import mongoose from "mongoose";

const searchHistorySchema = new mongoose.Schema({
  user: { type: String, default: "Anonymous" },
  category: { type: String, required: true },
  generatedQuery: { type: String, required: true },
  clickedImage: { type: String, default: null },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("SearchHistory", searchHistorySchema);
