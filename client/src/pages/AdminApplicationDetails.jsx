import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function AdminApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/applications/admin/${id}`);
        setApp(res.data.data);
      } catch (err) {
        console.error("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const getStatusColor = (status) => {
    if (status === "Offer") return "text-green-400";
    if (status === "Rejected") return "text-red-400";
    return "text-yellow-400";
  };

  if (loading) {
    return (
      <p className="text-center mt-20 text-slate-400">
        Loading…
      </p>
    );
  }

  if (!app) {
    return (
      <p className="text-center text-red-400 mt-20">
        Application not found
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-400 mb-6"
      >
        ← Back
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold">
          Application Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Student</p>
            <p className="font-medium break-all">
              {app.userId?.email}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Company</p>
            <p className="font-medium">{app.company}</p>
          </div>

          <div>
            <p className="text-slate-400">Role</p>
            <p className="font-medium">{app.role}</p>
          </div>

          <div>
            <p className="text-slate-400">Status</p>
            <p className={`font-medium ${getStatusColor(app.status)}`}>
              {app.status}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Current Round</p>
            <p className="font-medium">
              {app.currentRound || "—"}
            </p>
          </div>

          <div>
            <p className="text-slate-400">Rounds</p>
            <p className="font-medium">
              {app.rounds?.join(" → ") || "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminApplicationDetails;
