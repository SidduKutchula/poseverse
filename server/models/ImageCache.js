import mongoose from "mongoose";

const imageCacheSchema = new mongoose.Schema({
  pexelsId: { type: String, required: true, unique: true },
  query: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastAccessed: { type: Date, default: Date.now }
});

export default mongoose.model("ImageCache", imageCacheSchema);
