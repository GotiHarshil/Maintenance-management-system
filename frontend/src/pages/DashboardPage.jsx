import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (["ADMIN", "FINANCE"].includes(user?.role)) {
      API.get("/analytics/dashboard").then((res) => setStats(res.data)).catch(console.error);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">SOMMS Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.fullName} ({user?.role})</span>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </nav>

      <main className="p-6 max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Welcome, {user?.fullName}</h2>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Total Tickets</p>
              <p className="text-2xl font-bold">{stats.slaStats?.totalTickets || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">SLA Compliance</p>
              <p className="text-2xl font-bold text-green-600">{stats.slaStats?.slaComplianceRate || 100}%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Avg Resolution</p>
              <p className="text-2xl font-bold">{stats.avgResolutionHours || 0}h</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-blue-600">₹{stats.revenueStats?.totalRevenue || 0}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Navigate to Tickets, Invoices, or Analytics from the sidebar to get started.</p>
        </div>
      </main>
    </div>
  );
}
