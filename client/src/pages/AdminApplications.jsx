import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function AdminApplications() {
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ---------- DEBOUNCE SEARCH ---------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* ---------- RESET PAGE ---------- */
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  /* ---------- FETCH ---------- */
  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await api.get("/applications/admin/all", {
          params: {
            page,
            status,
            q: debouncedSearch
          }
        });

        setApplications(res.data.data);
        setPagination(res.data.pagination);
      } catch (err) {
        console.error("Failed to load admin applications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [page, status, debouncedSearch]);

  const getStatusColor = (status) => {
    if (status === "Offer") return "text-green-400";
    if (status === "Rejected") return "text-red-400";
    return "text-yellow-400";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        All Applications
      </h2>

      {/* ---------- FILTERS ---------- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm w-full sm:w-auto"
        >
          <option value="">All Status</option>
          <option value="In-Progress">In Progress</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by company, role, or student email"
          className="bg-slate-900 border border-slate-700 px-3 py-2 rounded text-sm w-full sm:w-80"
        />
      </div>

      {/* ---------- TABLE ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/70 flex items-center justify-center text-slate-400 text-sm z-10">
            Loading…
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="text-left px-4 py-2">Student</th>
                <th className="text-left px-4 py-2">Company</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-center px-4 py-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {applications.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-slate-400"
                  >
                    No applications found
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr
                    key={app._id}
                    onClick={() =>
                      navigate(`/admin/applications/${app._id}`)
                    }
                    className="border-b border-slate-800 hover:bg-slate-800 cursor-pointer"
                  >
                    <td className="px-4 py-2 break-all">
                      {app.userId?.email}
                    </td>
                    <td className="px-4 py-2">{app.company}</td>
                    <td className="px-4 py-2">{app.role}</td>
                    <td
                      className={`px-4 py-2 text-center font-medium ${getStatusColor(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------- PAGINATION ---------- */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-4 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-1 bg-slate-800 rounded disabled:opacity-40"
          >
            Prev
          </button>

          <span>
            Page {pagination.page} of {pagination.pages}
          </span>

          <button
            disabled={page === pagination.pages}
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-1 bg-slate-800 rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminApplications;
