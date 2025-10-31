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
import OrderManagement from "./pages/admin/orderManagement";
import ManageDealers from "./pages/evm/ManageDealers";
import PriceTable from "./pages/admin/priceTable";
import DealerManagement from "./pages/admin/dealerManagement";
import DealerLevels from "./pages/admin/dealerLevels";
import ManufacturerLayout from "./pages/components/manufacturerLayout";
import AuthGuard from "./components/AuthGuard";
import DebugAuth from "./components/DebugAuth";

function App() {
  return (
    <BrowserRouter>
      <DebugAuth />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin - Now part of Manufacturer */}
        {/* <Route path="/admin/ManageUsers" element={<ManageUsers />} /> */}

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/catalog" element={<VehicleCatalog />} />
        <Route path="/dealer/comparison" element={<VehicleComparison />} />
        <Route path="/dealer/orders" element={<ManageOrders />} />
        <Route path="/dealer/orders/:id" element={<OrderDetail />} />
        <Route path="/dealer/inventory" element={<Inventory />} />
        <Route path="/dealer/customers" element={<CustomerHistory />} />
        <Route path="/dealer/sales-report" element={<SalesReport />} />
        <Route path="/dealer/debt-report" element={<DebtReport />} />
        <Route path="/dealer/colors" element={<ColorManagement />} />
        <Route path="/dealer/staff" element={<ManageStaff />} />
        <Route path="/dealer/manageStaff" element={<ManageStaff />} />

        {/* EVM */}
        <Route
          path="/evm/ManageDealers"
          element={
            <AuthGuard>
              <ManageDealers />
            </AuthGuard>
          }
        />

        {/* Manufacturer */}
        <Route
          path="/manufacturer/dealerManagement"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <DealerManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/priceTable"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <PriceTable />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/dealer-levels"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <DealerLevels />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/users"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <ManageUsers />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/orders"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <OrderManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />

        {/* Redirect manufacturer root to dealerManagement */}
        <Route
          path="/manufacturer"
          element={<Navigate to="/manufacturer/dealerManagement" replace />}
        />

        {/* Default route (fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
