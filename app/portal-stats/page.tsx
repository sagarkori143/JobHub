"use client";

import React, { useEffect, useState } from "react";
import { BarChart2, Users, Mail, Briefcase, RefreshCw } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const statCards = [
  {
    label: "Total Users",
    key: "total_users",
    icon: <Users className="w-6 h-6" />,
    bg: "bg-blue-100",
    text: "text-blue-800",
    desc: "Users signed up"
  },
  {
    label: "Emails Generated",
    key: "total_emails_generated",
    icon: <Mail className="w-6 h-6" />,
    bg: "bg-green-100",
    text: "text-green-800",
    desc: "Job alert emails sent"
  },
  {
    label: "Jobs Added",
    key: "total_jobs_added",
    icon: <Briefcase className="w-6 h-6" />,
    bg: "bg-purple-100",
    text: "text-purple-800",
    desc: "Jobs added to portal"
  },
  {
    label: "Visits",
    key: "total_visits",
    icon: <BarChart2 className="w-6 h-6" />,
    bg: "bg-yellow-100",
    text: "text-yellow-800",
    desc: "Total site visits"
  },
];

const metricOptions = [
  { label: "Users", value: "users", icon: <Users className="w-5 h-5 mr-1" /> },
  { label: "Jobs", value: "jobs", icon: <Briefcase className="w-5 h-5 mr-1" /> },
  { label: "Emails", value: "emails", icon: <Mail className="w-5 h-5 mr-1" /> },
  { label: "Visits", value: "visits", icon: <BarChart2 className="w-5 h-5 mr-1" /> },
];

export default function PortalStatsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metric, setMetric] = useState("visits"); // Default to visits
  const [allTrends, setAllTrends] = useState<{ [key: string]: any[] }>({});
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    // Increment visits count on every page load
    console.log("📊 Portal Stats Page: Incrementing visits count");
    fetch("/api/portal-stats", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        console.log("📊 Portal Stats Page: Visit increment response:", data);
      })
      .catch(err => {
        console.error("❌ Portal Stats Page: Error incrementing visits:", err);
      });

    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        console.log("📊 Portal Stats Page: Fetching stats");
        const res = await fetch("/api/portal-stats");
        const json = await res.json();
        console.log("📊 Portal Stats Page: Stats response:", json);
        if (!json.success) throw new Error(json.error || "Failed to fetch stats");
        setStats(json.stats);
        console.log("📊 Portal Stats Page: Set stats:", json.stats);
      } catch (err: any) {
        console.error("❌ Portal Stats Page: Error fetching stats:", err);
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    async function fetchAllTrends() {
      setTrendLoading(true);
      try {
        const metrics = ["users", "jobs", "emails", "visits"];
        const results: { [key: string]: any[] } = {};
        for (const m of metrics) {
          const res = await fetch(`/api/portal-stats/daily?metric=${m}`);
          const json = await res.json();
          results[m] = (json.data || []).slice(-7);
        }
        setAllTrends(results);
      } catch {
        setAllTrends({});
      } finally {
        setTrendLoading(false);
      }
    }
    fetchAllTrends();
  }, []);

  // Show the trend for the selected metric
  const trend = allTrends[metric] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-8">
      <div className="mb-8 flex items-center gap-3">
        <BarChart2 className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">Portal Statistics</h1>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <RefreshCw className="animate-spin w-8 h-8 text-gray-400" />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <div
                key={card.key}
                className={`rounded-xl shadow-md p-7 flex flex-col items-start ${card.bg}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full p-2 bg-white shadow ${card.text}`}>{card.icon}</span>
                  <span className={`font-semibold text-base ${card.text}`}>{card.label}</span>
                </div>
                <div className={`text-4xl font-extrabold mb-1 ${card.text}`}>{stats?.[card.key] ?? "-"}</div>
                <div className="text-sm text-gray-600">{card.desc}</div>
              </div>
            ))}
          </div>
          <div className="mb-6 flex items-center gap-3">
            {metricOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setMetric(opt.value)}
                className={`flex items-center px-4 py-2 rounded-full font-medium transition focus:outline-none
                  ${metric === opt.value
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-100"}`}
                type="button"
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-lg text-gray-700">{metricOptions.find(m => m.value === metric)?.label} Trend (Last 7 Days)</span>
            </div>
            {trendLoading ? (
              <div className="flex justify-center items-center h-40">
                <RefreshCw className="animate-spin w-8 h-8 text-gray-400" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 14 }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey={metric} stroke="#6366f1" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} isAnimationActive animationDuration={350} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      )}
      {stats?.last_updated && !loading && !error && (
        <div className="text-sm text-gray-400 text-right mt-8">
          Last updated: {new Date(stats.last_updated).toLocaleString()}
        </div>
      )}
    </div>
  );
} 