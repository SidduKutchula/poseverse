import * as moodBoardService from "../services/moodBoardService.js";

export const getSavedPoses = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await moodBoardService.getSavedPosesForUser(userId);
    return res.json(list);
  } catch (error) {
    console.error("Controller getSavedPoses error:", error.message);
    res.status(500).json({ message: "Server error fetching moodboard" });
  }
};

export const addPose = async (req, res) => {
  try {
    const userId = req.user.id;
    const { poseId } = req.body;
    if (!poseId) {
      return res.status(400).json({ message: "Pose ID is required" });
    }

    const list = await moodBoardService.addPoseToSavedList(userId, poseId);
    return res.json(list);
  } catch (error) {
    console.error("Controller addPose error:", error.message);
    res.status(400).json({ message: error.message || "Error adding to moodboard" });
  }
};

export const reorderPoses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { poses } = req.body;
    if (!poses || !Array.isArray(poses)) {
      return res.status(400).json({ message: "Poses array is required" });
    }

    const list = await moodBoardService.reorderSavedPoses(userId, poses);
    return res.json(list);
  } catch (error) {
    console.error("Controller reorderPoses error:", error.message);
    res.status(400).json({ message: error.message || "Error reordering moodboard" });
  }
};

export const removePose = async (req, res) => {
  try {
    const userId = req.user.id;
    const { poseId } = req.params;

    const list = await moodBoardService.removePoseFromSavedList(userId, poseId);
    return res.json(list);
  } catch (error) {
    console.error("Controller removePose error:", error.message);
    res.status(400).json({ message: error.message || "Error removing from moodboard" });
  }
};

export const shareBoard = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await moodBoardService.shareMoodBoard(userId);
    return res.json(result);
  } catch (error) {
    console.error("Controller shareBoard error:", error.message);
    res.status(500).json({ message: "Server error sharing moodboard" });
  }
};

export const getSharedBoard = async (req, res) => {
  try {
    const { token } = req.params;
    const result = await moodBoardService.getMoodBoardByToken(token);
    return res.json(result);
  } catch (error) {
    console.error("Controller getSharedBoard error:", error.message);
    res.status(404).json({ message: error.message || "Shared mood board not found" });
  }
};
