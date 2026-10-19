import React, { useEffect, useState } from "react";
import { api } from "../util/api-url/api";

export default function LandingPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState([]);
  const [loading, setLoading] = useState(null);

  // Fetch Computer Data from API
  async function loadComputerData() {
    try {
      const response = await fetch(`${api}/api/system-stats`, {
        method: "GET",
      });
      // Display spinner
      const payload = await response.json();
      const formattedStats = {
        date: payload[0],
        cpu_metrics: JSON.parse(payload[1] || "{}"),
        mac_os_metrics: JSON.parse(payload[2] || "{}"),
        linux_metrics: JSON.parse(payload[3] || "{}"),
        swap_metrics: JSON.parse(payload[4] || "{}"),
        process_metrics: JSON.parse(payload[5] || "{}"),
      };

      setStats(formattedStats);
      setError([]);
    } catch (err) {
      console.log(err);
      setError([err.message]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComputerData();
    // Optional: Poll every 3 seconds for live dashboard updates
    const interval = setInterval(loadComputerData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error.length > 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950 text-red-400">
        <p>Error connecting to API: {error[0]}</p>
      </div>
    );
  }

  const cpu = stats?.cpu_metrics?.cpu;
  const swap = stats?.swap_metrics;
  const mac = stats?.mac_os_metrics;
  const processes = stats?.process_metrics?.top_5_processes;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-indigo-400">
              System Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Local Hardware & Performance Monitor
            </p>
          </div>
          <div className="text-xs text-slate-500 mt-2 md:mt-0 bg-slate-900 px-3 py-1.5 rounded-md border border-slate-800">
            Last Recorded:{" "}
            {stats?.date ? new Date(stats.date).toLocaleTimeString() : "N/A"}
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              CPU Usage
            </h3>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-indigo-400">
                {cpu?.percent}%
              </span>
              <span className="text-sm text-slate-500">{cpu?.cores} Cores</span>
            </div>
            <div className="mt-4 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${cpu?.percent}%` }}
              ></div>
            </div>
          </div>

          {/* Swap Memory Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              Swap Memory Used
            </h3>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl font-extrabold text-teal-400">
                {swap?.used_swap_memory
                  ? (swap?.used_swap_memory / 1024 ** 3).toFixed(2)
                  : 0}{" "}
                GB
              </span>
              <span className="text-sm text-slate-500">
                Total: {swap?.total_swap_memory}
              </span>
            </div>
            <div className="mt-4 text-xs text-slate-400 flex justify-between">
              <span>Sin: {swap?.sin}</span>
              <span>Sout: {swap?.sout}</span>
            </div>
          </div>

          {/* macOS Specifics Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              macOS Memory State
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                <p className="text-xs text-slate-400">Wired</p>
                <p className="text-lg font-semibold text-slate-200">
                  {mac?.wired_memory?.toFixed(2)} GB
                </p>
              </div>
              <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800/60">
                <p className="text-xs text-slate-400">Inactive</p>
                <p className="text-lg font-semibold text-slate-200">
                  {mac?.inactive_memory?.toFixed(2)} GB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Process Table Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-slate-200 mb-4">
            Top Memory Consumers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">PID</th>
                  <th className="py-3 px-4">Process Name</th>
                  <th className="py-3 px-4">RAM %</th>
                  <th className="py-3 px-4">RSS (MB)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {processes?.length > 0 ? (
                  processes?.map((p, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-indigo-400">
                        {p?.pid}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {p?.name}
                      </td>
                      <td className="py-3 px-4">{p?.percent?.toFixed(2)}%</td>
                      <td className="py-3 px-4 font-mono">{p?.rss_mb} MB</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-slate-500">
                      No process data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
