import User from "../models/User.js";

export const findByEmail = async (email) => {
  return User.findOne({ email });
};

export const findById = async (id) => {
  return User.findById(id);
};

export const create = async (userData) => {
  const user = new User(userData);
  return user.save();
};

export const updateRefreshToken = async (id, refreshToken) => {
  return User.findByIdAndUpdate(id, { refreshToken }, { new: true });
};

export const saveUser = async (userDoc) => {
  return userDoc.save();
};
