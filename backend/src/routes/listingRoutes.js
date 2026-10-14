import express from "express";
import { createListing } from "../controllers/listingController.js";
import {
  protect,
  requireSeller,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireSeller, createListing);

export default router;