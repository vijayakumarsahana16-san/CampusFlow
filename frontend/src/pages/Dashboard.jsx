import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, UserCheck, Plus, Download, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalRegistrations: 0,
    totalTeams: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/dashboard/stats");
        if (!response.ok) throw new Error("Failed to fetch dashboard stats");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statItems = [
    { label: 'Total Events', value: stats.totalEvents, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Events', value: stats.activeEvents, icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Registrations', value: stats.totalRegistrations, icon: UserCheck, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Teams', value: stats.totalTeams, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <center>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-sm text-slate-500">Welcome back! Here is what's happening today.</p>
          </center>
        </div>
        <div className="flex gap-2">  
        </div>
   
      </div>

      {/* Modern Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {statItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.label}</span>
                <div className={`p-2.5 rounded-lg ${item.bg}`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : item.value}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}