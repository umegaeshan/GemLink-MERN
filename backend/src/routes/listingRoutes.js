import express from "express";
import {
  createListing,
  getMyListings,
  updateListing,
} from "../controllers/listingController.js";
import {
  protect,
  requireSeller,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, requireSeller, getMyListings);
router.post("/", protect, requireSeller, createListing);
router.put("/:id", protect, requireSeller, updateListing);

export default router;