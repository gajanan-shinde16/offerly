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

function StudentAnalytics() {
  const [summary, setSummary] = useState(null);
  const [companyData, setCompanyData] = useState([]);
  const [roundData, setRoundData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, companyRes, roundRes] = await Promise.all([
          api.get("/analytics/summary"),
          api.get("/analytics/company"),
          api.get("/analytics/dropoff")
        ]);

        setSummary(summaryRes.data?.data || null);
        setCompanyData(companyRes.data?.data || []);
        setRoundData(roundRes.data?.data || []);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-400">
        Loading analytics…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <h2 className="text-2xl sm:text-3xl font-semibold">
        My Analytics
      </h2>

      {/* ---------- SUMMARY ---------- */}
      {summary && typeof summary.total === "number" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-300">Total Applications</p>
            <p className="text-2xl font-semibold text-blue-400 mt-1">
              {summary.total}
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-sm text-yellow-300">In Progress</p>
            <p className="text-2xl font-semibold text-yellow-400 mt-1">
              {summary["In-Progress"]}
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-sm text-green-300">Offers</p>
            <p className="text-2xl font-semibold text-green-400 mt-1">
              {summary.Offer}
            </p>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-300">Rejected</p>
            <p className="text-2xl font-semibold text-red-400 mt-1">
              {summary.Rejected}
            </p>
          </div>
        </div>
      )}

      {/* ---------- COMPANY WISE ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Company-wise Applications
        </h3>

        {companyData.length === 0 ? (
          <p className="text-slate-400">
            No company data available.
          </p>
        ) : (
          <div className="h-[320px] sm:h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={companyData}
                margin={{ top: 20, right: 20, left: 0, bottom: 80 }}
              >
                <XAxis
                  dataKey="_id"
                  stroke="#94a3b8"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    color: "#e5e7eb"
                  }}
                />
                <Bar dataKey="total" fill="#38bdf8" />
                <Bar dataKey="offers" fill="#22c55e" />
                <Bar dataKey="rejected" fill="#ef4444" />
                <Bar dataKey="inProgress" fill="#eab308" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ---------- ROUND DROP-OFF ---------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold mb-4">
          Rejection by Interview Round
        </h3>

        {roundData.length === 0 ? (
          <p className="text-slate-400">
            No rejection data available.
          </p>
        ) : (
          <div className="h-[280px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roundData}>
                <XAxis dataKey="_id" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                    color: "#e5e7eb"
                  }}
                />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentAnalytics;
