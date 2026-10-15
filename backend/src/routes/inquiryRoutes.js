import express from "express";

import {
  createInquiry,
  getMyInquiries,
  getReceivedInquiries,
} from "../controllers/inquiryController.js";

import {
  protect,
  requireBuyer,
  requireSeller,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  requireBuyer,
  createInquiry
);

router.get(
  "/mine",
  protect,
  requireBuyer,
  getMyInquiries
);

router.get(
  "/received",
  protect,
  requireSeller,
  getReceivedInquiries
);

export default router;