import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import DealerDashboard from "./pages/dealer/dashboard";
import ManageStaff from "./pages/dealer/manageStaff";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageDealers from "./pages/evm/ManageDealers";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/staff" element={<ManageStaff />} />

        {/* EVM */}
        <Route path="/evm/manage-dealers" element={<ManageDealers />} />

        {/* Admin */}
        <Route path="/admin/manage-users" element={<ManageUsers />} />

        {/* Default route (fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
