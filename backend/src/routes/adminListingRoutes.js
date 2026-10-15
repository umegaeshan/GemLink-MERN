import express from "express";

import {
  getPendingListings,
  approveListing,
  rejectListing,
} from "../controllers/adminListingController.js";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/pending", getPendingListings);
router.patch("/:id/approve", approveListing);
router.patch("/:id/reject", rejectListing);

export default router;