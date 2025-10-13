import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import Register from "./pages/login/Register";
import DealerDashboard from "./pages/dealer/dashboard";
import ManageStaff from "./pages/dealer/manageStaff";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageDealers from "./pages/evm/ManageDealers";
import ManageOrders from "./pages/dealer/manageOrders";
import PriceTable from "./pages/manufacturer/priceTable";
import DealerManagement from "./pages/manufacturer/dealerManagement";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/manageStaff" element={<ManageStaff />} />
        <Route path="/dealer/manageOrders" element={<ManageOrders />} />

        {/* EVM */}
        <Route path="/evm/ManageDealers" element={<ManageDealers />} />

        {/* Admin */}
        <Route path="/admin/ManageUsers" element={<ManageUsers />} />

        {/* Manufacturer */}
        <Route
          path="/manufacturer/dealerManagement"
          element={<DealerManagement />}
        />
        <Route path="/manufacturer/priceTable" element={<PriceTable />} />

        {/* Default route (fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
