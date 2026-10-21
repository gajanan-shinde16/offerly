
import express from "express";
import { protect } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";

import {
  connectGmail,
  gmailCallback,
  syncGmail,
  getMySuggestions,
  getMyAutoAppliedSuggestions,
  reviewSuggestion,
  getGmailStatus
} from "./emailAgent.controller.js";

import { reviewSuggestionSchema } from "./emailAgent.schema.js";

const router = express.Router();

// Gmail connection and synchronization
router.get("/gmail/connect", protect, connectGmail);
router.get("/gmail/callback", gmailCallback);
router.post("/gmail/sync", protect, syncGmail);
router.get("/gmail/status", protect, getGmailStatus);

// AI suggestions
router.get("/suggestions", protect, getMySuggestions);
router.get(
  "/suggestions/auto-applied",
  protect,
  getMyAutoAppliedSuggestions
);
router.post(
  "/suggestions/:id/review",
  protect,
  validate(reviewSuggestionSchema),
  reviewSuggestion
);

export default router;
