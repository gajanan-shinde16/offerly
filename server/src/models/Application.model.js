
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    package: {
      type: Number,
      min: 0
    },
    rounds: {
      type: [String],
      default: []
    },
    currentRound: {
      type: String,
      default: ""
    },
    status: {
      type: String,
      enum: ["In-Progress", "Offer", "Rejected"],
      default: "In-Progress"
    }
  },
  { timestamps: true }
);

// Indexes for application lookup and filtering.
applicationSchema.index({ company: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Application", applicationSchema);
