import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        setApp(res.data.data);
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const getStatusColor = (status) => {
    if (status === "Offer") return "text-green-400";
    if (status === "Rejected") return "text-red-400";
    return "text-yellow-400";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-red-400 text-center mt-20">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        onClick={() => navigate("/dashboard")}
        className="text-sm text-blue-400 mb-6 inline-flex items-center"
      >
        ← Back to Dashboard
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Application Details
          </h2>

          <button
            onClick={() => navigate(`/applications/${id}/edit`)}
            disabled={app.status !== "In-Progress"}
            className={`text-sm px-3 py-1 rounded
              ${
                app.status === "In-Progress"
                  ? "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  : "bg-slate-700 text-slate-400 cursor-not-allowed"
              }`}
            title={
              app.status !== "In-Progress"
                ? "Completed applications cannot be edited"
                : "Edit application"
            }
          >
            Edit
          </button>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="text-slate-400">Company</label>
            <p className="mt-1 break-words">{app.company}</p>
          </div>

          <div>
            <label className="text-slate-400">Role</label>
            <p className="mt-1 break-words">{app.role}</p>
          </div>

          <div>
            <label className="text-slate-400">Package (CTC)</label>
            <p className="mt-1">{app.package}</p>
          </div>

          <div>
            <label className="text-slate-400">Current Round</label>
            <p className="mt-1 break-words">
              {app.currentRound || "—"}
            </p>
          </div>

          <div>
            <label className="text-slate-400">Status</label>
            <p className={`mt-1 font-medium ${getStatusColor(app.status)}`}>
              {app.status}
            </p>
          </div>

          <div>
            <label className="text-slate-400">Rounds</label>
            <p className="mt-1 break-words">
              {app.rounds?.join(" → ") || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ApplicationDetails;
