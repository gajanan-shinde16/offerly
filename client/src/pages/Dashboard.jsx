import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function Dashboard() {
  const [applications, setApplications] = useState([]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState(null);

  const [selectedApp, setSelectedApp] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    status: "",
    currentRound: ""
  });

  const navigate = useNavigate();

  /* ---------- DEBOUNCE ---------- */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ---------- RESET PAGE ---------- */
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get("/applications/me", {
          params: { page, status, q: debouncedSearch }
        });
        setApplications(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Failed to load applications", err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchApplications();
  }, [page, status, debouncedSearch]);

  /* ---------- INLINE UPDATE ---------- */
  const startInlineEdit = (app, e) => {
    e.stopPropagation();
    setEditingId(app._id);
    setEditData({
      status: app.status,
      currentRound: app.currentRound || ""
    });
  };

  const cancelInlineEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditData({ status: "", currentRound: "" });
  };

  const saveInlineEdit = async (id, e) => {
    e.stopPropagation();
    if (!editData.status) return;

    try {
      const res = await api.patch(`/applications/${id}/status`, editData);
      setApplications(apps =>
        apps.map(app =>
          app._id === id ? res.data.data : app
        )
      );
      setEditingId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async () => {
    if (!selectedApp) return;

    try {
      await api.delete(`/applications/${selectedApp._id}`);
      setApplications(apps =>
        apps.filter(a => a._id !== selectedApp._id)
      );
      setSelectedApp(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        Loading applications…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6">
        My Applications
      </h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search company / role / round"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm"
      />

      {/* FILTER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-sm text-slate-300">Status</label>
        <select
          className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm w-full sm:w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="In-Progress">In Progress</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* APPLICATIONS */}
      <div className="space-y-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-slate-400 text-sm z-10">
            Updating…
          </div>
        )}

        {applications.length === 0 ? (
          <p className="text-slate-400">No applications found.</p>
        ) : (
          applications.map(app => (
            <div
              key={app._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:border-slate-600 transition"
            >
              <div
                onClick={() => navigate(`/applications/${app._id}`)}
                className="cursor-pointer flex-1"
              >
                <p className="text-base sm:text-lg font-semibold break-words">
                  {app.company}
                </p>
                <p className="text-sm text-slate-400 break-words">
                  {app.role}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {editingId !== app._id && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full
                      ${app.status === "Offer" && "bg-green-500/10 text-green-400"}
                      ${app.status === "Rejected" && "bg-red-500/10 text-red-400"}
                      ${app.status === "In-Progress" && "bg-yellow-500/10 text-yellow-400"}
                    `}
                  >
                    {app.status}
                  </span>
                )}

                {app.status === "In-Progress" && (
                  editingId === app._id ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        value={editData.currentRound}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            currentRound: e.target.value
                          })
                        }
                        className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs"
                      />
                      <select
                        value={editData.status}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            status: e.target.value
                          })
                        }
                        className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-xs"
                      >
                        <option value="In-Progress">In Progress</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <button
                        onClick={(e) => saveInlineEdit(app._id, e)}
                        className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => cancelInlineEdit(e)}
                        className="px-2 py-1 text-xs rounded bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={(e) => startInlineEdit(app, e)}
                        className="px-3 py-1 text-xs rounded bg-blue-500/10 text-blue-400"
                      >
                        Update
                      </button>

                      {/* ✅ DELETE BUTTON (ADDED) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedApp(app);
                        }}
                        className="px-3 py-1 text-xs rounded bg-red-500/10 text-red-400"
                      >
                        Delete
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-1 rounded bg-slate-800 text-sm disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-1 rounded bg-slate-800 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* DELETE MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-3">
              Delete Application?
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-1 text-sm rounded bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1 text-sm rounded bg-red-500/20 text-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;