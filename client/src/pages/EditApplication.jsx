import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

function EditApplication() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company: "",
    role: "",
    package: "",
    rounds: "",
    currentRound: "",
    status: "In-Progress"
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        const app = res.data.data;

        setForm({
          company: app.company,
          role: app.role,
          package: app.package,
          rounds: app.rounds.join(", "),
          currentRound: app.currentRound || "",
          status: app.status
        });
      } catch {
        setError("Failed to load application");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await api.put(`/applications/${id}`, {
        ...form,
        package: Number(form.package),
        rounds: form.rounds.split(",").map(r => r.trim())
      });

      navigate(`/applications/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
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
      <p className="text-red-400 text-center mt-10">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-blue-400 mb-4"
      >
        ← Back
      </button>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6">
          Edit Application
        </h2>

        {[
          ["company", "Company"],
          ["role", "Role"],
          ["package", "Package (LPA)"],
          ["currentRound", "Current Round"]
        ].map(([key, label]) => (
          <div key={key} className="mb-4">
            <label className="text-sm text-slate-400">
              {label}
            </label>
            <input
              name={key}
              value={form[key]}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mt-1 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        ))}

        {/* STATUS */}
        <div className="mb-4">
          <label className="text-sm text-slate-400">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mt-1 text-sm"
          >
            <option value="In-Progress">In Progress</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* ROUNDS */}
        <div className="mb-6">
          <label className="text-sm text-slate-400">Rounds</label>
          <input
            name="rounds"
            value={form.rounds}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 px-3 py-2 rounded mt-1 text-sm"
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-5 py-2 text-sm rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditApplication;
