import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import applicationRoutes from "./modules/applications/application.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/applications", applicationRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
