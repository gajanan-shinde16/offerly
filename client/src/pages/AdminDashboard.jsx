import { useEffect, useState } from "react";
import api from "../api/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get("/analytics/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        Loading admin dashboard…
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-red-400 mt-20">
        Failed to load admin data.
      </div>
    );
  }

  const {
    totalUsers,
    totalApplications,
    applicationsByStatus,
    topCompanies
  } = stats;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Admin Dashboard
      </h2>

      {/* ---------- SUMMARY ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-300">Total Users</p>
          <p className="text-2xl font-semibold text-blue-400 mt-1">
            {totalUsers}
          </p>
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
          <p className="text-sm text-indigo-300">
            Total Applications
          </p>
          <p className="text-2xl font-semibold text-indigo-400 mt-1">
            {totalApplications}
          </p>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <p className="text-sm text-green-300">Offers</p>
          <p className="text-2xl font-semibold text-green-400 mt-1">
            {applicationsByStatus.Offer}
          </p>
        </div>

        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-sm text-red-300">Rejected</p>
          <p className="text-2xl font-semibold text-red-400 mt-1">
            {applicationsByStatus.Rejected}
          </p>
        </div>
      </div>

      {/* ---------- TOP COMPANIES ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Top Companies (Applications)
        </h3>

        {topCompanies.length === 0 ? (
          <p className="text-slate-400">No data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700">
                  <th className="text-left py-2">Company</th>
                  <th className="text-right py-2">
                    Applications
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCompanies.map((c) => (
                  <tr
                    key={c._id}
                    className="border-b border-slate-800"
                  >
                    <td className="py-2 break-words">
                      {c._id}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {c.count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
