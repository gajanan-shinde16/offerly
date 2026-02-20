import express from "express";
import {
  getMySummary,
  companyWiseStats,
  roundDropOff,
  getAdminStats
} from "./analytics.controller.js";

import { protect } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/* ---------- STUDENT ANALYTICS ---------- */
router.get("/summary", protect, getMySummary);
router.get("/company", protect, companyWiseStats);
router.get("/dropoff", protect, roundDropOff);

/* ---------- ADMIN ANALYTICS ---------- */
router.get(
  "/stats",
  protect,
  allowRoles("admin"),
  getAdminStats
);

export default router;
