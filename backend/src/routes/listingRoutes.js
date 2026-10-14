import express from "express";
import {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";
import {
  protect,
  requireSeller,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, requireSeller, getMyListings);
router.post("/", protect, requireSeller, createListing);
router.put("/:id", protect, requireSeller, updateListing);
router.delete("/:id", protect, requireSeller, deleteListing);

export default router;