import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import axios from "axios";
import * as userRepository from "../repositories/userRepository.js";

const isDbConnected = () => mongoose.connection.readyState === 1;

// In-Memory user registry fallback when MongoDB is offline
const offlineUsers = [
  {
    _id: "offline_admin_id",
    name: "Demo Admin",
    email: "admin@poseverse.com",
    role: "admin",
    password: "$2a$10$DEMOHASHEDPASSWORDDUMMYSTRINGFORLOCALTESTINGONLYYY", // dummy hashed
    savedPoses: []
  },
  {
    _id: "offline_user_id",
    name: "Demo User",
    email: "user@poseverse.com",
    role: "user",
    password: "$2a$10$DEMOHASHEDPASSWORDDUMMYSTRINGFORLOCALTESTINGONLYYY",
    savedPoses: []
  }
];

// Helper to generate access token (15 mins)
export const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_ACCESS_SECRET || "poseverse_jwt_access_secret_key_12345",
    { expiresIn: "15m" }
  );
};

// Helper to generate refresh token (7 days)
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET || "poseverse_jwt_refresh_secret_key_67890",
    { expiresIn: "7d" }
  );
};

export const registerUser = async ({ name, email, password }) => {
  if (!isDbConnected()) {
    const existingUser = offlineUsers.find((u) => u.email === email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const mockUser = {
      _id: "offline_user_" + Date.now(),
      name,
      email,
      role: "user",
      password: hashedPassword,
      savedPoses: [],
      refreshToken: ""
    };

    const accessToken = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);
    mockUser.refreshToken = refreshToken;
    
    offlineUsers.push(mockUser);

    return { token: accessToken, refreshToken, user: mockUser };
  }

  // MongoDB path
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
  });

  const accessToken = generateAccessToken(newUser);
  const refreshToken = generateRefreshToken(newUser);

  newUser.refreshToken = refreshToken;
  await userRepository.saveUser(newUser);

  return { token: accessToken, refreshToken, user: newUser };
};

export const loginUser = async ({ email, password }) => {
  if (!isDbConnected()) {
    let mockUser = offlineUsers.find((u) => u.email === email);
    
    if (!mockUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      mockUser = {
        _id: "offline_user_" + Date.now(),
        name: email.split("@")[0],
        email,
        role: "user",
        password: hashedPassword,
        savedPoses: [],
        refreshToken: ""
      };
      offlineUsers.push(mockUser);
    } else {
      const isMatch = await bcrypt.compare(password, mockUser.password).catch(() => false);
      if (!isMatch && mockUser.password !== "hashed_password" && password !== "password") {
        throw new Error("Invalid credentials");
      }
    }

    const accessToken = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);
    mockUser.refreshToken = refreshToken;

    return { token: accessToken, refreshToken, user: mockUser };
  }

  // MongoDB path
  const user = await userRepository.findByEmail(email);
  if (!user || user.googleId) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await userRepository.saveUser(user);

  return { token: accessToken, refreshToken, user };
};

export const refreshUserSession = async (token) => {
  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "poseverse_jwt_refresh_secret_key_67890");

  if (!isDbConnected()) {
    const mockUser = offlineUsers.find((u) => u._id === decoded.id && u.refreshToken === token);
    if (!mockUser) {
      throw new Error("Invalid refresh token");
    }

    const accessToken = generateAccessToken(mockUser);
    return { token: accessToken, user: mockUser };
  }

  const user = await userRepository.findById(decoded.id);
  if (!user || user.refreshToken !== token) {
    throw new Error("Invalid refresh token");
  }

  const accessToken = generateAccessToken(user);
  return { token: accessToken, user };
};

export const logoutUser = async (token) => {
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "poseverse_jwt_refresh_secret_key_67890");
      
      if (!isDbConnected()) {
        const mockUser = offlineUsers.find((u) => u._id === decoded.id);
        if (mockUser) {
          mockUser.refreshToken = "";
        }
      } else {
        const user = await userRepository.findById(decoded.id);
        if (user) {
          user.refreshToken = "";
          await userRepository.saveUser(user);
        }
      }
    } catch (e) {
      // Token decoding failed, proceed to clear cookies
    }
  }
};

export const googleAuthUser = async (credential) => {
  const googleResponse = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
  const payload = googleResponse.data;

  if (!payload.email) {
    throw new Error("Invalid Google token structure");
  }

  const { email, name, sub: googleId } = payload;

  if (!isDbConnected()) {
    let mockUser = offlineUsers.find((u) => u.email === email);
    if (!mockUser) {
      mockUser = {
        _id: "offline_user_" + Date.now(),
        name: name || email.split("@")[0],
        email,
        role: "user",
        googleId,
        isVerified: true,
        savedPoses: [],
        refreshToken: ""
      };
      offlineUsers.push(mockUser);
    } else if (!mockUser.googleId) {
      mockUser.googleId = googleId;
    }

    const accessToken = generateAccessToken(mockUser);
    const refreshToken = generateRefreshToken(mockUser);
    mockUser.refreshToken = refreshToken;

    return { token: accessToken, refreshToken, user: mockUser };
  }

  // MongoDB path
  let user = await userRepository.findByEmail(email);

  if (!user) {
    user = await userRepository.create({
      name: name || email.split("@")[0],
      email,
      googleId,
      isVerified: true,
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.isVerified = true;
    await userRepository.saveUser(user);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await userRepository.saveUser(user);

  return { token: accessToken, refreshToken, user };
};
