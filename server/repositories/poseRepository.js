import Pose from "../models/Pose.js";

export const findAll = async ({ filter = {}, page = 1, limit = 20, sort = {} }) => {
  const skip = (page - 1) * limit;
  return Pose.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

export const findById = async (id) => {
  // Support lookup by string custom ID or MongoDB ObjectId
  if (typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) {
    return Pose.findOne({ $or: [{ _id: id }, { id }] });
  }
  return Pose.findOne({ id });
};

export const count = async (filter = {}) => {
  return Pose.countDocuments(filter);
};

export const create = async (poseData) => {
  const pose = new Pose(poseData);
  return pose.save();
};
