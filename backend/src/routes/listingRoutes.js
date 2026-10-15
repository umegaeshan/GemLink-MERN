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
  getPublicListingPhoto,
} from "../controllers/listingPhotoController.js";

import {
  protect,
  requireSeller,
} from "../middleware/authMiddleware.js";

import {
  uploadListingPhotos,
} from "../middleware/uploadMiddleware.js";

import {
  getPublicListings,
  getPublicListing,
} from "../controllers/publicListingController.js";






const router = express.Router();
router.get("/", getPublicListings);

router.get(
  "/mine",
  protect,
  requireSeller,
  getMyListings
);

router.get(
  "/",
   getPublicListings
);

router.get(
  "/mine", 
  protect, 
  requireSeller, 
  getMyListings
);

router.get(
  "/:id", 
  getPublicListing
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
  getListingPhoto
);

router.get(
  "/:id/public-photos/:filename",
  getPublicListingPhoto
);

export default router;