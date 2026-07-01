import MoodBoard from "../models/MoodBoard.js";

export const findByUserId = async (userId) => {
  return MoodBoard.find({ userId }).populate("poses");
};

export const findById = async (id) => {
  return MoodBoard.findById(id).populate("poses");
};

export const findByShareToken = async (shareToken) => {
  return MoodBoard.findOne({ shareToken }).populate("poses");
};

export const create = async (boardData) => {
  const board = new MoodBoard(boardData);
  return board.save();
};

export const deleteById = async (id) => {
  const board = await MoodBoard.findById(id);
  if (board) {
    return board.softDelete();
  }
  return null;
};

export const saveMoodBoard = async (boardDoc) => {
  return boardDoc.save();
};
