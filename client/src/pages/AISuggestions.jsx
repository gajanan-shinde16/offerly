import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";

function AISuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [autoAppliedSuggestions, setAutoAppliedSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState("");
  const [success, setSuccess] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const [gmailStatus, setGmailStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      setError("");

      const [pendingRes, autoAppliedRes] = await Promise.all([
        api.get("/email-agent/suggestions"),
        api.get("/email-agent/suggestions/auto-applied")
      ]);

      setSuggestions(pendingRes.data.suggestions || []);
      setAutoAppliedSuggestions(
        autoAppliedRes.data.suggestions || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load AI suggestions."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchGmailStatus = async () => {
    try {
      setStatusLoading(true);

      const res = await api.get("/email-agent/gmail/status");
      setGmailStatus(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load Gmail connection status."
      );
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    fetchGmailStatus();
  }, []);

  useEffect(() => {
    if (searchParams.get("gmail") === "connected") {
      setSuccess("Gmail connected successfully.");
      fetchGmailStatus();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConnectGmail = async () => {
    try {
      setConnecting(true);
      setError("");
      setSuccess("");

      const res = await api.get("/email-agent/gmail/connect");
      const authUrl = res.data.authUrl;

      if (!authUrl) {
        throw new Error("Google authorization URL was not returned.");
      }

      window.location.assign(authUrl);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to connect Gmail."
      );
      setConnecting(false);
    }
  };

  const handleSyncGmail = async () => {
    try {
      setSyncing(true);
      setError("");
      setSuccess("");
      setSyncResult("");

      const res = await api.post("/email-agent/gmail/sync");
      const result = res.data;

      setSyncResult(
        `${result.message || "Gmail sync completed"}. ` +
          `Fetched: ${result.fetchedCount ?? 0}, ` +
          `Processed: ${result.processedCount ?? 0}, ` +
          `Auto-updated: ${result.autoUpdatedCount ?? 0}, ` +
          `Pending approval: ${result.reviewCount ?? 0}, ` +
          `Discarded: ${result.ignoredCount ?? 0}.`
      );

      await Promise.all([
        fetchSuggestions(),
        fetchGmailStatus()
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to sync Gmail. Connect your Gmail account first."
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleReview = async (suggestionId, decision) => {
    try {
      setReviewingId(suggestionId);
      setError("");
      setSuccess("");

      const res = await api.post(
        `/email-agent/suggestions/${suggestionId}/review`,
        { decision }
      );

      setSuccess(
        res.data.message ||
          (decision === "approve"
            ? "Suggestion approved successfully."
            : "Suggestion rejected successfully.")
      );

      await fetchSuggestions();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${decision} suggestion.`
      );
    } finally {
      setReviewingId("");
    }
  };

  const getConfidenceLabel = (confidence) => {
    if (typeof confidence !== "number") {
      return { text: "Unavailable", className: "text-slate-400" };
    }

    const percentage = Math.round(confidence * 100);

    if (percentage >= 90) {
      return { text: `${percentage}%`, className: "text-green-400" };
    }

    if (percentage >= 70) {
      return { text: `${percentage}%`, className: "text-yellow-400" };
    }

    return { text: `${percentage}%`, className: "text-red-400" };
  };

  const renderSuggestionDetails = (suggestion) => {
    const confidence = getConfidenceLabel(suggestion.confidence);

    return (
      <div className="mt-4 space-y-2 text-sm">
        <p className="break-words">
          <span className="text-slate-400">Email subject: </span>
          {suggestion.subject || "No subject"}
        </p>

        <p>
          <span className="text-slate-400">Event: </span>
          {suggestion.eventType || "Unknown"}
        </p>

        <p>
          <span className="text-slate-400">Suggested status: </span>
          {suggestion.suggestedStatus || "Not specified"}
        </p>

        <p>
          <span className="text-slate-400">Suggested round: </span>
          {suggestion.suggestedRound || "Not specified"}
        </p>

        <p>
          <span className="text-slate-400">AI confidence: </span>
          <span className={`font-medium ${confidence.className}`}>
            {confidence.text}
          </span>
        </p>

        {suggestion.receivedAt && (
          <p>
            <span className="text-slate-400">Received: </span>
            {new Date(suggestion.receivedAt).toLocaleString()}
          </p>
        )}

        {suggestion.reviewedAt && (
          <p>
            <span className="text-slate-400">Updated: </span>
            {new Date(suggestion.reviewedAt).toLocaleString()}
          </p>
        )}
      </div>
    );
  };

  const renderSuggestionCard = (suggestion, type) => (
    <div
      key={suggestion._id}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">
            {suggestion.company || "Unknown company"}
          </h3>

          <p className="text-sm text-slate-400 mt-1">
            {suggestion.role || "Role not identified"}
          </p>
        </div>

        <span
          className={`self-start text-xs font-medium px-3 py-1 rounded-full ${
            type === "auto"
              ? "bg-green-500/10 text-green-400"
              : "bg-yellow-500/10 text-yellow-400"
          }`}
        >
          {type === "auto" ? "Auto-updated" : "Pending approval"}
        </span>
      </div>

      {renderSuggestionDetails(suggestion)}

      {type === "pending" && (
        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleReview(suggestion._id, "approve")}
            disabled={Boolean(reviewingId) || syncing}
            className="px-4 py-2 text-sm rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50"
          >
            {reviewingId === suggestion._id ? "Processing..." : "Approve"}
          </button>

          <button
            type="button"
            onClick={() => handleReview(suggestion._id, "reject")}
            disabled={Boolean(reviewingId) || syncing}
            className="px-4 py-2 text-sm rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
          >
            {reviewingId === suggestion._id ? "Processing..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-slate-400">
        Loading AI suggestions...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            AI Email Suggestions
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Automatic placement tracking with review for uncertain emails.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchSuggestions}
          disabled={Boolean(reviewingId) || syncing}
          className="px-4 py-2 text-sm rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h3 className="font-semibold text-lg">Gmail Connection</h3>

            {statusLoading ? (
              <p className="text-sm text-slate-400 mt-2">
                Checking connection status...
              </p>
            ) : gmailStatus?.connected && gmailStatus?.isActive ? (
              <>
                <p className="text-sm text-slate-300 mt-2 break-all">
                  {gmailStatus.email}
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  Last synced:{" "}
                  {gmailStatus.lastSyncedAt
                    ? new Date(gmailStatus.lastSyncedAt).toLocaleString()
                    : "Never synced"}
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-400 mt-2">
                No active Gmail account connected.
              </p>
            )}
          </div>

          {!statusLoading && (
            <span
              className={`self-start text-xs font-medium px-3 py-1 rounded-full ${
                gmailStatus?.connected && gmailStatus?.isActive
                  ? "bg-green-500/10 text-green-400"
                  : "bg-yellow-500/10 text-yellow-400"
              }`}
            >
              {gmailStatus?.connected && gmailStatus?.isActive
                ? "Connected"
                : "Not connected"}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={handleConnectGmail}
            disabled={connecting || syncing}
            className="px-4 py-2 text-sm rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-50"
          >
            {connecting ? "Connecting..." : "Connect Gmail"}
          </button>

          <button
            type="button"
            onClick={handleSyncGmail}
            disabled={
              syncing ||
              connecting ||
              Boolean(reviewingId) ||
              statusLoading ||
              !gmailStatus?.connected ||
              !gmailStatus?.isActive
            }
            className="px-4 py-2 text-sm rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-50"
          >
            {syncing ? "Syncing emails..." : "Sync Gmail"}
          </button>

          <button
            type="button"
            onClick={fetchGmailStatus}
            disabled={statusLoading || syncing}
            className="px-4 py-2 text-sm rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            {statusLoading ? "Checking..." : "Refresh Status"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded px-3 py-2">
          {success}
        </div>
      )}

      {syncResult && (
        <div className="mb-4 text-sm text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded px-3 py-2">
          {syncResult}
        </div>
      )}

      <section className="mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold">Auto-Updated Suggestions</h3>
            <p className="text-sm text-slate-400 mt-1">
              High-confidence emails successfully applied to matching applications.
            </p>
          </div>

          <span className="text-sm text-green-400 bg-green-500/10 rounded-full px-3 py-1">
            {autoAppliedSuggestions.length}
          </span>
        </div>

        {autoAppliedSuggestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-sm text-slate-400">
            No auto-updated suggestions yet.
          </div>
        ) : (
          <div className="space-y-4">
            {autoAppliedSuggestions.map((suggestion) =>
              renderSuggestionCard(suggestion, "auto")
            )}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-semibold">Pending Approval</h3>
            <p className="text-sm text-slate-400 mt-1">
              Medium-confidence suggestions need your decision.
            </p>
          </div>

          <span className="text-sm text-yellow-400 bg-yellow-500/10 rounded-full px-3 py-1">
            {suggestions.length}
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center">
            <h4 className="text-lg font-semibold mb-2">
              No pending suggestions
            </h4>
            <p className="text-sm text-slate-400">
              Sync Gmail to check for new placement emails.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((suggestion) =>
              renderSuggestionCard(suggestion, "pending")
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AISuggestions;