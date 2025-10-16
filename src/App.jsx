import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import DealerDashboard from "./pages/dealer/dashboard";
import ManageStaff from "./pages/dealer/manageStaff";
import ManageOrders from "./pages/dealer/manageOrders";
import Inventory from "./pages/dealer/inventory";
import CustomerHistory from "./pages/dealer/customerHistory";
import OrderDetail from "./pages/dealer/orderDetail";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageDealers from "./pages/evm/ManageDealers";
import PriceTable from "./pages/manufacturer/priceTable";
import DealerManagement from "./pages/manufacturer/dealerManagement";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/staff" element={<ManageStaff />} />
        <Route path="/dealer/orders" element={<ManageOrders />} />
        <Route path="/dealer/orders/:id" element={<OrderDetail />} />
        <Route path="/dealer/inventory" element={<Inventory />} />
        <Route path="/dealer/customers" element={<CustomerHistory />} />

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
