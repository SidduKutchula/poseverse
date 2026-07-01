import express from "express";
import * as photoController from "../controllers/photoController.js";

const router = express.Router();

router.get("/", photoController.getPhotos);

export default router;
