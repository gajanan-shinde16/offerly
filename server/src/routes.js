import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import applicationRoutes from "./modules/applications/application.routes.js";
import analyticsRoutes from "./modules/analytics/analytics.routes.js";
import emailAgentRoutes from "./modules/email-agent/emailAgent.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/applications", applicationRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/email-agent", emailAgentRoutes);

export default router;
