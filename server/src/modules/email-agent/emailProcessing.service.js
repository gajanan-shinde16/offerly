
import GmailAccount from "../../models/GmailAccount.model.js";
import AISuggestion from "../../models/AISuggestion.model.js";
import Application from "../../models/Application.model.js";

import {
  getOAuthClient,
  getNewGmailMessages,
  getGmailMessage
} from "./gmail.service.js";

import {
  decryptToken,
  encryptToken
} from "./tokenEncryption.service.js";

import { classifyPlacementEmail } from "./openai.service.js";

const HIGH_CONFIDENCE_THRESHOLD = 0.9;
const REVIEW_CONFIDENCE_THRESHOLD = 0.7;

const activeSyncs = new Set();

const normalizeCompany = (name) =>
  (name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const normalizeRole = (name) =>
  (name || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");

const normalizeRound = (round) =>
  (round || "").toLowerCase().trim();

const getHeader = (headers, name) =>
  headers?.find(
    (header) => header.name?.toLowerCase() === name.toLowerCase()
  )?.value || "";

const decodeBody = (data) => {
  if (!data) return "";
  return Buffer.from(data, "base64url").toString("utf8");
};

const extractEmailBody = (part) => {
  if (!part) return "";

  if (part.mimeType === "text/plain" && part.body?.data) {
    return decodeBody(part.body.data);
  }

  for (const child of part.parts || []) {
    const body = extractEmailBody(child);
    if (body) return body;
  }

  if (part.mimeType === "text/html" && part.body?.data) {
    return decodeBody(part.body.data)
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  return "";
};

const getMessageBody = (message) =>
  extractEmailBody(message.payload);

const findMatchingApplication = async (userId, company, role) => {
  if (!company || !role) return null;

  const applications = await Application.find({
    userId,
    status: "In-Progress"
  }).select("_id company role status currentRound rounds");

  const matches = applications.filter(
    (application) =>
      normalizeCompany(application.company) === normalizeCompany(company) &&
      normalizeRole(application.role) === normalizeRole(role)
  );

  return matches.length === 1 ? matches[0] : null;
};

const updateApplicationFromEmail = async (application, result) => {
  if (result.round) {
    if (!Array.isArray(application.rounds)) {
      application.rounds = [];
    }

    const roundExists = application.rounds.some(
      (round) => normalizeRound(round) === normalizeRound(result.round)
    );

    if (!roundExists) {
      application.rounds.push(result.round);
    }

    application.currentRound = result.round;
  }

  if (["In-Progress", "Offer", "Rejected"].includes(result.status)) {
    application.status = result.status;
  }

  await application.save();
};

const createIgnoredSuggestion = async ({
  userId,
  messageId,
  subject,
  receivedAt,
  result
}) => {
  await AISuggestion.create({
    userId,
    gmailMessageId: messageId,
    subject,
    receivedAt,
    company: result.company,
    role: result.role,
    eventType: result.eventType,
    suggestedStatus: result.status,
    suggestedRound: result.round,
    confidence: result.confidence,
    processingStatus: "ignored"
  });
};

export const processNewEmails = async (userId) => {
  const syncKey = userId.toString();

  if (activeSyncs.has(syncKey)) {
    return {
      fetchedCount: 0,
      processedCount: 0,
      autoUpdatedCount: 0,
      reviewCount: 0,
      ignoredCount: 0,
      skipped: true,
      message: "Gmail sync already in progress"
    };
  }

  activeSyncs.add(syncKey);

  try {
    const account = await GmailAccount.findOne({
      userId,
      isActive: true
    });

    if (!account) {
      throw new Error("No active Gmail account found");
    }

    const oauth2Client = getOAuthClient();

    oauth2Client.setCredentials({
      access_token: decryptToken(account.encryptedAccessToken),
      refresh_token: decryptToken(account.encryptedRefreshToken),
      expiry_date: account.tokenExpiry?.getTime()
    });

    oauth2Client.on("tokens", async (tokens) => {
      try {
        const updates = {};

        if (tokens.access_token) {
          updates.encryptedAccessToken = encryptToken(tokens.access_token);
        }

        if (tokens.expiry_date) {
          updates.tokenExpiry = new Date(tokens.expiry_date);
        }

        if (tokens.refresh_token) {
          updates.encryptedRefreshToken = encryptToken(tokens.refresh_token);
        }

        if (Object.keys(updates).length > 0) {
          await GmailAccount.updateOne(
            { _id: account._id },
            { $set: updates }
          );
        }
      } catch (error) {
        console.error(
          "[Email Agent] Unable to save refreshed Gmail tokens:",
          error.message
        );
      }
    });

    const syncStartedAt = new Date();

    const messages = await getNewGmailMessages(
      oauth2Client,
      account.lastSyncedAt
    );

    let processedCount = 0;
    let autoUpdatedCount = 0;
    let reviewCount = 0;
    let ignoredCount = 0;

    console.log(`[Email Agent] Fetched ${messages.length} Gmail messages`);

    for (const message of messages) {
      if (!message.id) continue;

      const alreadyProcessed = await AISuggestion.exists({
        userId,
        gmailMessageId: message.id
      });

      if (alreadyProcessed) {
        console.log(
          `[Email Agent] Skipping previously processed message: ${message.id}`
        );
        continue;
      }

      const fullMessage = await getGmailMessage(
        oauth2Client,
        message.id
      );

      const headers = fullMessage.payload?.headers || [];
      const subject = getHeader(headers, "Subject");
      const sender = getHeader(headers, "From");
      const dateHeader = getHeader(headers, "Date");

      const parsedDate = dateHeader ? new Date(dateHeader) : null;
      const receivedAt =
        parsedDate && !Number.isNaN(parsedDate.getTime())
          ? parsedDate
          : undefined;

      const body = getMessageBody(fullMessage);

      const result = await classifyPlacementEmail({
        subject,
        sender,
        body: body.slice(0, 12000)
      });

      const confidence = Number(result.confidence);

      const validConfidence =
        Number.isFinite(confidence) &&
        confidence >= 0 &&
        confidence <= 1;

      console.log("[Email Agent] Classification result:", {
        subject,
        company: result.company,
        role: result.role,
        isPlacementRelated: result.isPlacementRelated,
        confidence,
        status: result.status,
        round: result.round
      });

      if (
        !result.isPlacementRelated ||
        !validConfidence ||
        confidence < REVIEW_CONFIDENCE_THRESHOLD
      ) {
        const reason = !result.isPlacementRelated
          ? "Not classified as placement-related"
          : !validConfidence
            ? "Invalid confidence score"
            : "Confidence below 0.70";

        console.log("[Email Agent] Discarding email:", {
          subject,
          reason,
          confidence
        });

        await createIgnoredSuggestion({
          userId,
          messageId: message.id,
          subject,
          receivedAt,
          result
        });

        processedCount++;
        ignoredCount++;
        continue;
      }

      const application = await findMatchingApplication(
        userId,
        result.company,
        result.role
      );

      if (!application) {
        console.log(
          "[Email Agent] Discarding email: no unique application match",
          {
            subject,
            extractedCompany: result.company,
            extractedRole: result.role
          }
        );

        await createIgnoredSuggestion({
          userId,
          messageId: message.id,
          subject,
          receivedAt,
          result
        });

        processedCount++;
        ignoredCount++;
        continue;
      }

      if (confidence >= HIGH_CONFIDENCE_THRESHOLD) {
        await updateApplicationFromEmail(application, result);

        await AISuggestion.create({
          userId,
          gmailMessageId: message.id,
          applicationId: application._id,
          subject,
          receivedAt,
          company: result.company,
          role: result.role,
          eventType: result.eventType,
          suggestedStatus: result.status,
          suggestedRound: result.round,
          confidence,
          processingStatus: "auto_applied",
          reviewedAt: new Date()
        });

        console.log("[Email Agent] Automatically updated application:", {
          subject,
          applicationId: application._id.toString(),
          confidence
        });

        processedCount++;
        autoUpdatedCount++;
        continue;
      }

      await AISuggestion.create({
        userId,
        gmailMessageId: message.id,
        subject,
        receivedAt,
        company: result.company,
        role: result.role,
        eventType: result.eventType,
        suggestedStatus: result.status,
        suggestedRound: result.round,
        confidence,
        processingStatus: "pending_review"
      });

      console.log("[Email Agent] Added pending-review suggestion:", {
        subject,
        confidence
      });

      processedCount++;
      reviewCount++;
    }

    account.lastSyncedAt = syncStartedAt;
    await account.save();

    const summary = {
      fetchedCount: messages.length,
      processedCount,
      autoUpdatedCount,
      reviewCount,
      ignoredCount,
      skipped: false
    };

    console.log("[Email Agent] Sync summary:", summary);

    return summary;
  } finally {
    activeSyncs.delete(syncKey);
  }
};
