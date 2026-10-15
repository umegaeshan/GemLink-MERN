import express from "express";

import {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
} from "../controllers/listingController.js";

import {
  addListingPhotos,
  getListingPhoto,
} from "../controllers/listingPhotoController.js";

import {
  protect,
  requireSeller,
} from "../middleware/authMiddleware.js";

import {
  uploadListingPhotos,
} from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get(
  "/mine",
  protect,
  requireSeller,
  getMyListings
);

router.post(
  "/",
  protect,
  requireSeller,
  createListing
);

router.put(
  "/:id",
  protect,
  requireSeller,
  updateListing
);

router.delete(
  "/:id",
  protect,
  requireSeller,
  deleteListing
);

router.post(
  "/:id/photos",
  protect,
  requireSeller,
  uploadListingPhotos,
  addListingPhotos
);

router.get(
  "/:id/photos/:filename",
  protect,
  getListingPhoto
);

export default router;