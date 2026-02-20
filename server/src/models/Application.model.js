import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    company: String,
    role: String,
    package: Number,
    rounds: [String],
    currentRound: String,
    status: {
      type: String,
      enum: ["In-Progress", "Offer", "Rejected"],
      default: "In-Progress"
    }
  },
  { timestamps: true }
);

// Indexes for performance
applicationSchema.index({ company: 1 });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Application", applicationSchema);
