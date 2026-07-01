import { validationResult } from "express-validator";
import * as userService from "../services/userService.js";

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array(), message: errors.array()[0].msg });
  }

  const { name, email, password } = req.body;

  try {
    const { token, refreshToken, user } = await userService.registerUser({ name, email, password });

    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${isProd ? "; Secure" : ""}`
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Controller Registration error:", error.message);
    res.status(400).json({ message: error.message || "Server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    const { token, refreshToken, user } = await userService.loginUser({ email, password });

    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${isProd ? "; Secure" : ""}`
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Controller Login error:", error.message);
    res.status(400).json({ message: error.message || "Server error during login" });
  }
};

export const refresh = async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    // Parse cookies manually or use a library
    const cookies = cookieHeader.split(";").reduce((acc, c) => {
      const parts = c.split("=");
      acc[parts[0].trim()] = (parts[1] || "").trim();
      return acc;
    }, {});

    const token = cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const { token: accessToken, user } = await userService.refreshUserSession(token);
    return res.json({
      token: accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Controller Token refresh error:", error.message);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

export const logout = async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const cookies = cookieHeader.split(";").reduce((acc, c) => {
      const parts = c.split("=");
      acc[parts[0].trim()] = (parts[1] || "").trim();
      return acc;
    }, {});

    const token = cookies.refreshToken;
    await userService.logoutUser(token);

    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? "; Secure" : ""}`
    );
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Controller Logout error:", error);
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${isProd ? "; Secure" : ""}`
    );
    return res.json({ message: "Logged out" });
  }
};

export const googleLogin = async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  try {
    const { token, refreshToken, user } = await userService.googleAuthUser(credential);

    const isProd = process.env.NODE_ENV === "production";
    res.setHeader(
      "Set-Cookie",
      `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=604800; SameSite=Lax${isProd ? "; Secure" : ""}`
    );

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Controller Google auth error:", error.message);
    res.status(400).json({ message: "Google authentication failed" });
  }
};
