import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

function AddApplication() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: "",
    role: "",
    package: "",
    status: "In-Progress",
    rounds: "",
    currentRound: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/applications", {
        ...form,
        package: Number(form.package),
        rounds: form.rounds
          ? form.rounds.split(",").map(r => r.trim())
          : []
      });

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create application"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:py-10">
      <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-slate-100">
            Add Application
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track a new company application
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded px-3 py-2">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Company
            </label>
            <input
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Google, Amazon, Infosys..."
              required
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Role
            </label>
            <input
              name="role"
              value={form.role}
              onChange={handleChange}
              placeholder="Software Engineer"
              required
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Package */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Package (CTC)
            </label>
            <input
              name="package"
              type="number"
              value={form.package}
              onChange={handleChange}
              placeholder="1200000"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
            >
              <option value="In-Progress">In Progress</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Rounds */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Rounds
            </label>
            <input
              name="rounds"
              value={form.rounds}
              onChange={handleChange}
              placeholder="OA, Technical, HR"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Comma separated
            </p>
          </div>

          {/* Current Round */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Current Round
            </label>
            <input
              name="currentRound"
              value={form.currentRound}
              onChange={handleChange}
              placeholder="Technical Interview"
              className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddApplication;
