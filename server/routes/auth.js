import express from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Registration route
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required").trim(),
    body("email").isEmail().withMessage("Please enter a valid email address").normalizeEmail(),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long"),
  ],
  authController.register
);

// Login route
router.post("/login", authController.login);

// Refresh endpoint
router.post("/refresh", authController.refresh);

// Logout endpoint
router.post("/logout", authController.logout);

// Google Login endpoint
router.post("/google", authController.googleLogin);

export default router;
