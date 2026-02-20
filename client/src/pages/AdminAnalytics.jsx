import { useEffect, useState } from "react";
import api from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get("/analytics/stats");
        setStats(res.data.data);
      } catch (err) {
        console.error("Failed to load admin analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        Loading admin analytics…
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-slate-400 mt-20">
        No admin analytics data available.
      </div>
    );
  }

  /* ---------- PREP DATA ---------- */
  const statusData = Object.entries(stats.applicationsByStatus).map(
    ([status, count]) => ({
      status,
      count
    })
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        Admin Analytics
      </h2>

      {/* ---------- SUMMARY ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <p className="text-sm text-blue-300">Total Users</p>
          <p className="text-2xl font-semibold text-blue-400 mt-1">
            {stats.totalUsers}
          </p>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <p className="text-sm text-purple-300">
            Total Applications
          </p>
          <p className="text-2xl font-semibold text-purple-400 mt-1">
            {stats.totalApplications}
          </p>
        </div>
      </div>

      {/* ---------- STATUS DISTRIBUTION ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Applications by Status
        </h3>

        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData}>
              <XAxis dataKey="status" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                  color: "#e5e7eb"
                }}
              />
              <Bar dataKey="count" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ---------- TOP COMPANIES ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Top Companies (by Applications)
        </h3>

        {stats.topCompanies.length === 0 ? (
          <p className="text-slate-400">
            No company data available.
          </p>
        ) : (
          <div className="h-[280px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topCompanies}>
                <XAxis
                  dataKey="_id"
                  stroke="#94a3b8"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    color: "#e5e7eb"
                  }}
                />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAnalytics;
