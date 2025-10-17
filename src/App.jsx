import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/login";
import DealerDashboard from "./pages/dealer/dashboard";
import ManageStaff from "./pages/dealer/manageStaff";
import ManageOrders from "./pages/dealer/manageOrders";
import Inventory from "./pages/dealer/inventory";
import CustomerHistory from "./pages/dealer/customerHistory";
import OrderDetail from "./pages/dealer/orderDetail";
import VehicleCatalog from "./pages/dealer/vehicleCatalog";
import VehicleComparison from "./pages/dealer/vehicleComparison";
import SalesReport from "./pages/dealer/salesReport";
import DebtReport from "./pages/dealer/debtReport";
import ColorManagement from "./pages/dealer/colorManagement";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageDealers from "./pages/evm/ManageDealers";
import PriceTable from "./pages/manufacturer/priceTable";
import DealerManagement from "./pages/manufacturer/dealerManagement";
import AuthGuard from "./components/AuthGuard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<AuthGuard><DealerDashboard /></AuthGuard>} />
        <Route path="/dealer/staff" element={<AuthGuard><ManageStaff /></AuthGuard>} />
        <Route path="/dealer/orders" element={<AuthGuard><ManageOrders /></AuthGuard>} />
        <Route path="/dealer/orders/:id" element={<AuthGuard><OrderDetail /></AuthGuard>} />
        <Route path="/dealer/inventory" element={<AuthGuard><Inventory /></AuthGuard>} />
        <Route path="/dealer/customers" element={<AuthGuard><CustomerHistory /></AuthGuard>} />
                <Route path="/dealer/catalog" element={<AuthGuard><VehicleCatalog /></AuthGuard>} />
                <Route path="/dealer/comparison" element={<AuthGuard><VehicleComparison /></AuthGuard>} />
                <Route path="/dealer/sales-report" element={<AuthGuard><SalesReport /></AuthGuard>} />
                <Route path="/dealer/debt-report" element={<AuthGuard><DebtReport /></AuthGuard>} />
                <Route path="/dealer/colors" element={<AuthGuard><ColorManagement /></AuthGuard>} />

        {/* EVM */}
        <Route path="/evm/ManageDealers" element={<AuthGuard><ManageDealers /></AuthGuard>} />

        {/* Admin */}
        <Route path="/admin/ManageUsers" element={<AuthGuard><ManageUsers /></AuthGuard>} />

        {/* Manufacturer */}
        <Route
          path="/manufacturer/dealerManagement"
          element={<AuthGuard><DealerManagement /></AuthGuard>}
        />
        <Route path="/manufacturer/priceTable" element={<AuthGuard><PriceTable /></AuthGuard>} />

        {/* Default route (fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
