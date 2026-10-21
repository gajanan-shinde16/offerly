
import mongoose from "mongoose";

const gmailAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    encryptedAccessToken: {
      type: String,
      required: true
    },
    encryptedRefreshToken: {
      type: String,
      required: true
    },
    tokenExpiry: Date,
    lastSyncedAt: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("GmailAccount", gmailAccountSchema);
