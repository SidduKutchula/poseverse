import express from "express";
import { protect } from "../middleware/auth.js";
import * as moodBoardController from "../controllers/moodBoardController.js";

const router = express.Router();

// GET user's saved poses
router.get("/", protect, moodBoardController.getSavedPoses);

// POST add pose to moodboard
router.post("/add", protect, moodBoardController.addPose);

// POST reorder poses in moodboard
router.post("/reorder", protect, moodBoardController.reorderPoses);

// DELETE remove pose from moodboard
router.delete("/:poseId", protect, moodBoardController.removePose);

// POST generate share token
router.post("/share", protect, moodBoardController.shareBoard);

// GET shared moodboard by token
router.get("/share/:token", moodBoardController.getSharedBoard);

export default router;
