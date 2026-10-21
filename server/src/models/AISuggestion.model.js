
import mongoose from "mongoose";

const aiSuggestionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application"
    },
    gmailMessageId: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      default: ""
    },
    receivedAt: Date,
    company: {
      type: String,
      default: ""
    },
    role: {
      type: String,
      default: ""
    },
    eventType: {
      type: String,
      enum: [
        "assessment",
        "interview",
        "offer",
        "rejection",
        "shortlisting",
        "other"
      ]
    },
    suggestedStatus: {
      type: String,
      enum: ["In-Progress", "Offer", "Rejected"]
    },
    suggestedRound: {
      type: String,
      default: ""
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    processingStatus: {
      type: String,
      enum: [
        "pending_review",
        "approved",
        "rejected",
        "auto_applied",
        "ignored",
        "failed"
      ],
      default: "pending_review"
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

// Prevent duplicate suggestion records for the same user's Gmail message.
aiSuggestionSchema.index(
  { userId: 1, gmailMessageId: 1 },
  { unique: true }
);

// Support filtering suggestions by user and processing status.
aiSuggestionSchema.index({ userId: 1, processingStatus: 1 });

// Support lookups by application.
aiSuggestionSchema.index({ applicationId: 1 });

export default mongoose.model("AISuggestion", aiSuggestionSchema);
