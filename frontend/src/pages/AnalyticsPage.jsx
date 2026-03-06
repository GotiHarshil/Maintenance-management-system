import { useAuth } from "../context/AuthContext";

export default function AnalyticsPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">AnalyticsPage</h1>
      <p className="text-gray-600">Role: {user?.role} — Build out this page with API calls to the backend.</p>
    </div>
  );
}
