import express from "express";
import * as poseController from "../controllers/poseController.js";

const router = express.Router();

// GET all/filtered poses
router.get("/", poseController.getPoses);

// GET category definitions list
router.get("/categories", poseController.getCategoriesList);

// GET visually similar poses by structure
router.get("/:id/similar", poseController.getSimilarPoses);

// GET single pose by ID
router.get("/:id", poseController.getPoseById);

export default router;
