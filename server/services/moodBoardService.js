import mongoose from "mongoose";
import crypto from "crypto";
import * as userRepository from "../repositories/userRepository.js";
import * as poseRepository from "../repositories/poseRepository.js";
import * as moodBoardRepository from "../repositories/moodBoardRepository.js";
import { POSES } from "../../client/src/data/poses.js";

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-memory fallback registry for offline user moodboard updates
const offlineUserSavedPoses = {}; // mapping of userId to list of poses
const offlineMoodBoards = []; // list of shareable public boards

const generateToken = () => {
  return crypto.randomBytes(16).toString("hex");
};

export const getSavedPosesForUser = async (userId) => {
  if (!isDbConnected()) {
    return offlineUserSavedPoses[userId] || [];
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Populate savedPoses
  const populatedUser = await user.populate("savedPoses");
  return populatedUser.savedPoses;
};

export const addPoseToSavedList = async (userId, poseId) => {
  if (!isDbConnected()) {
    const list = offlineUserSavedPoses[userId] || [];
    const pose = POSES.find((p) => p.id === poseId || p._id === poseId);
    
    if (!pose) {
      throw new Error("Pose not found");
    }

    if (!list.some((p) => p.id === pose.id)) {
      list.push({
        ...pose,
        _id: pose.id,
      });
    }

    offlineUserSavedPoses[userId] = list;
    return list;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const pose = await poseRepository.findById(poseId);
  if (!pose) {
    throw new Error("Pose not found");
  }

  if (!user.savedPoses.includes(pose._id)) {
    user.savedPoses.push(pose._id);
    await userRepository.saveUser(user);
  }

  const populatedUser = await user.populate("savedPoses");
  return populatedUser.savedPoses;
};

export const reorderSavedPoses = async (userId, poseIds) => {
  if (!isDbConnected()) {
    const list = offlineUserSavedPoses[userId] || [];
    
    // Sort list according to the order of poseIds
    const orderedList = poseIds
      .map((id) => list.find((p) => p.id === id || p._id === id))
      .filter(Boolean);

    offlineUserSavedPoses[userId] = orderedList;
    return orderedList;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Overwrite order of saved poses
  user.savedPoses = poseIds;
  await userRepository.saveUser(user);

  const populatedUser = await user.populate("savedPoses");
  return populatedUser.savedPoses;
};

export const removePoseFromSavedList = async (userId, poseId) => {
  if (!isDbConnected()) {
    const list = offlineUserSavedPoses[userId] || [];
    const updated = list.filter((p) => p.id !== poseId && p._id !== poseId);
    offlineUserSavedPoses[userId] = updated;
    return updated;
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const pose = await poseRepository.findById(poseId);
  if (pose) {
    user.savedPoses = user.savedPoses.filter(
      (id) => id.toString() !== pose._id.toString() && id.toString() !== poseId
    );
    await userRepository.saveUser(user);
  }

  const populatedUser = await user.populate("savedPoses");
  return populatedUser.savedPoses;
};

export const shareMoodBoard = async (userId) => {
  const shareToken = generateToken();

  if (!isDbConnected()) {
    const list = offlineUserSavedPoses[userId] || [];
    const mockBoard = {
      _id: "offline_board_" + Date.now(),
      userId,
      poses: list,
      shareToken,
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    offlineMoodBoards.push(mockBoard);
    return { shareToken };
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Create or update public MoodBoard mapping document
  let moodBoard = await moodBoardRepository.findByShareToken(shareToken);
  if (moodBoard) {
    moodBoard.poses = user.savedPoses;
    moodBoard.isPublic = true;
    await moodBoardRepository.saveMoodBoard(moodBoard);
  } else {
    moodBoard = await moodBoardRepository.create({
      userId: user._id,
      poses: user.savedPoses,
      shareToken,
      isPublic: true,
    });
  }

  return { shareToken };
};

export const getMoodBoardByToken = async (shareToken) => {
  if (!isDbConnected()) {
    const board = offlineMoodBoards.find((mb) => mb.shareToken === shareToken);
    if (!board) {
      // Return first 5 poses mock data to keep layout active
      const mockSharedPoses = POSES.slice(0, 5).map((p, idx) => ({
        ...p,
        _id: p.id || `mock_pose_${idx + 1}`,
      }));
      return { poses: mockSharedPoses, isPublic: true };
    }
    return { poses: board.poses, isPublic: board.isPublic };
  }

  const board = await moodBoardRepository.findByShareToken(shareToken);
  if (!board || !board.isPublic) {
    throw new Error("Shared mood board not found or private");
  }
  return { poses: board.poses, isPublic: board.isPublic };
};
