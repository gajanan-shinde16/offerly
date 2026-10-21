
const AUTO_APPLY_THRESHOLD = 0.90;

const HIGH_RISK_EVENTS = ["offer", "rejection"];

const AUTO_APPLY_EVENTS = [
  "assessment",
  "interview",
  "shortlisting"
];

export const decidePlacementAction = ({
  isPlacementRelated,
  confidence,
  eventType,
  applicationMatch,
  companyMatch,
  roleMatch
}) => {
  if (!isPlacementRelated) {
    return {
      processingStatus: "ignored",
      finalConfidence: 0,
      reason: "Email is not placement-related"
    };
  }

  if (
    typeof confidence !== "number" ||
    confidence < 0 ||
    confidence > 1
  ) {
    return {
      processingStatus: "pending_review",
      finalConfidence: 0,
      reason: "Invalid AI confidence value"
    };
  }

  if (!applicationMatch) {
    return {
      processingStatus: "pending_review",
      finalConfidence: confidence,
      reason: "No matching application was found"
    };
  }

  const finalConfidence =
    0.60 * confidence +
    0.25 * Number(companyMatch) +
    0.15 * Number(roleMatch);

  if (HIGH_RISK_EVENTS.includes(eventType)) {
    return {
      processingStatus: "pending_review",
      finalConfidence,
      reason: "Offers and rejections require human approval"
    };
  }

  if (!AUTO_APPLY_EVENTS.includes(eventType)) {
    return {
      processingStatus: "pending_review",
      finalConfidence,
      reason: "Event type requires manual review"
    };
  }

  if (!companyMatch || !roleMatch) {
    return {
      processingStatus: "pending_review",
      finalConfidence,
      reason: "Company or role could not be matched confidently"
    };
  }

  if (finalConfidence < AUTO_APPLY_THRESHOLD) {
    return {
      processingStatus: "pending_review",
      finalConfidence,
      reason: "Confidence is below the automatic processing threshold"
    };
  }

  return {
    processingStatus: "auto_applied",
    finalConfidence,
    reason: "Event passed the automatic processing policy"
  };
};
