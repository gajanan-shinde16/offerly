
import jwt from "jsonwebtoken";
import GmailAccount from "../../models/GmailAccount.model.js";
import Application from "../../models/Application.model.js";
import AISuggestion from "../../models/AISuggestion.model.js";
import {
  getGmailAuthUrl,
  exchangeAuthCode,
  getGmailProfile
} from "./gmail.service.js";
import { encryptToken } from "./tokenEncryption.service.js";
import { processNewEmails } from "./emailProcessing.service.js";

const HIGH_CONFIDENCE_THRESHOLD = 0.9;
const REVIEW_CONFIDENCE_THRESHOLD = 0.7;

const normalizeCompany = (name) =>
  (name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const normalizeRole = (name) =>
  (name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const normalizeRound = (round) =>
  (round || "").toLowerCase().trim();

const isReviewConfidence = (confidence) =>
  typeof confidence === "number" &&
  confidence >= REVIEW_CONFIDENCE_THRESHOLD &&
  confidence < HIGH_CONFIDENCE_THRESHOLD;

const findMatchingApplication = async (suggestion, userId) => {
  if (!suggestion.company || !suggestion.role) {
    return null;
  }

  const applications = await Application.find({
    userId,
    status: "In-Progress"
  }).select("_id company role status currentRound rounds");

  const matches = applications.filter(
    (application) =>
      normalizeCompany(application.company) ===
        normalizeCompany(suggestion.company) &&
      normalizeRole(application.role) ===
        normalizeRole(suggestion.role)
  );

  return matches.length === 1 ? matches[0] : null;
};

export const connectGmail = async (req, res) => {
  try {
    const state = jwt.sign(
      { userId: req.user.userId, purpose: "gmail-oauth" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    return res.status(200).json({
      authUrl: getGmailAuthUrl(state)
    });
  } catch (error) {
    console.error("Gmail connection error:", error.message);
    return res.status(500).json({
      message: "Unable to start Gmail connection"
    });
  }
};

export const gmailCallback = async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).send("Gmail authorization was cancelled");
    }

    if (!code || !state) {
      return res.status(400).send("Missing OAuth code or state");
    }

    const decoded = jwt.verify(state, process.env.JWT_SECRET);

    if (decoded.purpose !== "gmail-oauth" || !decoded.userId) {
      return res.status(400).send("Invalid OAuth state");
    }

    const { oauth2Client, tokens } = await exchangeAuthCode(code);
    const profile = await getGmailProfile(oauth2Client);
    const email = profile.emailAddress?.toLowerCase();

    if (!email) {
      return res.status(400).send("Unable to identify Gmail account");
    }

    const existingAccount = await GmailAccount.findOne({
      userId: decoded.userId
    });

    const refreshToken = tokens.refresh_token ||
      (existingAccount ? null : undefined);

    if (!refreshToken && !existingAccount?.encryptedRefreshToken) {
      return res.status(400).send(
        "Google did not provide a refresh token. Please reconnect and grant consent."
      );
    }

    if (!tokens.access_token) {
      return res.status(400).send(
        "Google did not provide an access token. Please reconnect Gmail."
      );
    }

    const accountData = {
      email,
      encryptedAccessToken: encryptToken(tokens.access_token),
      tokenExpiry: tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : undefined,
      isActive: true
    };

    if (refreshToken) {
      accountData.encryptedRefreshToken = encryptToken(refreshToken);
    }

    await GmailAccount.findOneAndUpdate(
      { userId: decoded.userId },
      {
        $set: accountData,
        $setOnInsert: { userId: decoded.userId }
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    return res.redirect(
      `${process.env.CLIENT_URL}/dashboard?gmail=connected`
    );
  } catch (error) {
    console.error("Gmail OAuth callback error:", error.message);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(400).send("Invalid or expired OAuth state");
    }

    return res.status(500).send("Unable to complete Gmail connection");
  }
};

export const syncGmail = async (req, res) => {
  try {
    const result = await processNewEmails(req.user.userId);

    return res.status(200).json({
      message: "Gmail sync completed",
      ...result
    });
  } catch (error) {
    console.error("Gmail sync error:", error.message);
    return res.status(500).json({
      message: "Unable to sync Gmail"
    });
  }
};

export const getMySuggestions = async (req, res) => {
  try {
    const suggestions = await AISuggestion.find({
      userId: req.user.userId,
      processingStatus: "pending_review",
      confidence: {
        $gte: REVIEW_CONFIDENCE_THRESHOLD,
        $lt: HIGH_CONFIDENCE_THRESHOLD
      }
    })
      .sort({ receivedAt: -1 })
      .limit(50)
      .select(
        "subject receivedAt company role eventType suggestedStatus suggestedRound confidence processingStatus"
      );

    return res.status(200).json({
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error("Fetch AI suggestions error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch AI suggestions"
    });
  }
};

export const getMyAutoAppliedSuggestions = async (req, res) => {
  try {
    const suggestions = await AISuggestion.find({
      userId: req.user.userId,
      processingStatus: "auto_applied",
      confidence: { $gte: HIGH_CONFIDENCE_THRESHOLD }
    })
      .sort({ reviewedAt: -1, receivedAt: -1 })
      .limit(50)
      .select(
        "subject receivedAt company role eventType suggestedStatus suggestedRound confidence processingStatus reviewedAt applicationId"
      );

    return res.status(200).json({
      count: suggestions.length,
      suggestions
    });
  } catch (error) {
    console.error("Fetch auto-applied suggestions error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch auto-updated suggestions"
    });
  }
};

export const getGmailStatus = async (req, res) => {
  try {
    const account = await GmailAccount.findOne({
      userId: req.user.userId
    }).select("email isActive lastSyncedAt");

    if (!account) {
      return res.status(200).json({
        connected: false,
        email: null,
        isActive: false,
        lastSyncedAt: null
      });
    }

    return res.status(200).json({
      connected: account.isActive,
      email: account.email,
      isActive: account.isActive,
      lastSyncedAt: account.lastSyncedAt || null
    });
  } catch (error) {
    console.error("Gmail status error:", error.message);
    return res.status(500).json({
      message: "Unable to fetch Gmail connection status"
    });
  }
};

export const reviewSuggestion = async (req, res) => {
  try {
    const { decision } = req.body;

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({
        message: "Decision must be approve or reject"
      });
    }

    const suggestion = await AISuggestion.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      processingStatus: "pending_review"
    });

    if (!suggestion) {
      return res.status(404).json({
        message: "Pending suggestion not found"
      });
    }

    if (!isReviewConfidence(suggestion.confidence)) {
      suggestion.processingStatus = "ignored";
      suggestion.reviewedAt = new Date();
      await suggestion.save();

      return res.status(200).json({
        message:
          "Suggestion discarded because it is outside the review confidence range"
      });
    }

    if (decision === "reject") {
      suggestion.processingStatus = "rejected";
      suggestion.reviewedAt = new Date();
      await suggestion.save();

      return res.status(200).json({
        message: "Suggestion rejected"
      });
    }

    const application = await findMatchingApplication(
      suggestion,
      req.user.userId
    );

    if (!application) {
      suggestion.processingStatus = "ignored";
      suggestion.reviewedAt = new Date();
      await suggestion.save();

      return res.status(200).json({
        message:
          "Suggestion discarded because no unique company and role match was found"
      });
    }

    if (suggestion.suggestedRound) {
      if (!Array.isArray(application.rounds)) {
        application.rounds = [];
      }

      const roundExists = application.rounds.some(
        (round) =>
          normalizeRound(round) ===
          normalizeRound(suggestion.suggestedRound)
      );

      if (!roundExists) {
        application.rounds.push(suggestion.suggestedRound);
      }

      application.currentRound = suggestion.suggestedRound;
    }

    if (
      ["In-Progress", "Offer", "Rejected"].includes(
        suggestion.suggestedStatus
      )
    ) {
      application.status = suggestion.suggestedStatus;
    }

    await application.save();

    suggestion.applicationId = application._id;
    suggestion.processingStatus = "approved";
    suggestion.reviewedAt = new Date();
    await suggestion.save();

    return res.status(200).json({
      message: "Suggestion approved and matching application updated",
      application
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid suggestion ID"
      });
    }

    console.error("Review suggestion error:", error.message);
    return res.status(500).json({
      message: "Unable to review suggestion"
    });
  }
};
