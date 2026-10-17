import express from "express";

import {
  protect,
  requireAdmin,
} from "../middleware/authMiddleware.js";

import {
  getAdminUsers,
  getAdminStones,
  changeUserRole,
  deleteAdminUser,
  changeListingStatus,
  deleteAdminStone,
} from "../controllers/adminManagementController.js";

const router = express.Router();

router.use(protect, requireAdmin);

router.get("/users", getAdminUsers);
router.patch("/users/:id/role", changeUserRole);
router.delete("/users/:id", deleteAdminUser);

router.get("/stones", getAdminStones);
router.patch("/stones/:id/status", changeListingStatus);
router.delete("/stones/:id", deleteAdminStone);

export default router;