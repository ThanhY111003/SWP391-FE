// src/pages/admin/Dashboard.jsx
import AdminLayout from "../components/adminlayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
        <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm border">
          <div className="text-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
            <p>Dashboard content will be implemented here.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}