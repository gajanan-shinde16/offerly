import express from "express";
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplication,
  deleteApplication,
  getStudentDashboard,
  getAllApplications,
  getAdminApplicationById
} from "./application.controller.js";

import {
  createApplicationSchema,
  updateStatusSchema,
  updateApplicationSchema
} from "./application.schema.js";

import { validate } from "../../middlewares/validate.middleware.js";
import { protect } from "../../middlewares/auth.middleware.js";
import { allowRoles } from "../../middlewares/role.middleware.js";

const router = express.Router();

/* ---------- STUDENT ---------- */
router.get("/dashboard", protect, getStudentDashboard);
router.get("/me", protect, getMyApplications);

router.post(
  "/",
  protect,
  validate(createApplicationSchema),
  createApplication
);

router.get("/:id", protect, getApplicationById);

router.patch(
  "/:id/status",
  protect,
  validate(updateStatusSchema),
  updateApplicationStatus
);

router.put(
  "/:id",
  protect,
  validate(updateApplicationSchema),
  updateApplication
);

router.delete("/:id", protect, deleteApplication);

/* ---------- ADMIN ---------- */
router.get(
  "/admin/all",
  protect,
  allowRoles("admin"),
  getAllApplications
);

router.get(
  "/admin/:id",
  protect,
  allowRoles("admin"),
  getAdminApplicationById
);

export default router;
