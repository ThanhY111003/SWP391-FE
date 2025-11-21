import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/login/login";
import ManageOrders from "./pages/dealer/manageOrders";
import Inventory from "./pages/dealer/inventory";
import CustomerHistory from "./pages/dealer/customerHistory";
import OrderDetail from "./pages/dealer/orderDetail";
import VehicleCatalog from "./pages/dealer/vehicleCatalog";
import VehicleComparison from "./pages/dealer/vehicleComparison";
import SalesReport from "./pages/dealer/salesReport";
import ManageCustomers from "./pages/dealer/manageCustomers";
import ManageVehicles from "./pages/dealer/manageVehicles";
import VehicleList from "./pages/dealer/vehicleList";
import VehicleDetail from "./pages/dealer/vehicleDetail";
import Cart from "./pages/dealer/cart";
import CreateOrder from "./pages/dealer/createOrder";
import DealerDashboard from "./pages/dealer/dashboard";
import VehiclePriceManagement from "./pages/dealer/vehiclePriceManagement";
import WarrantyManagement from "./pages/dealer/warrantyManagement";
import ManageUsers from "./pages/admin/ManageUsers";
import OrderManagement from "./pages/admin/orderManagement";
import AdminColorManagement from "./pages/admin/ColorManagement";
import VehicleModelColors from "./pages/admin/VehicleModelColors";
import VehicleModels from "./pages/admin/VehicleModels";
import VehicleInstances from "./pages/admin/VehicleInstances";
import ManageDealers from "./pages/evm/ManageDealers";
import PriceTable from "./pages/admin/priceTable";
import DealerManagement from "./pages/admin/dealerManagement";
import DealerLevels from "./pages/admin/dealerLevels";
import Reports from "./pages/admin/Reports";
import Inventories from "./pages/admin/Inventories";
import PermissionManagement from "./pages/admin/PermissionManagement";
import WarrantyRequests from "./pages/admin/WarrantyRequests";
import ManufacturerLayout from "./pages/components/manufacturerLayout";
import AuthGuard from "./components/AuthGuard";
import DebugAuth from "./components/DebugAuth";
import Forbidden from "./pages/Forbidden";

const DEALER_ROLES = ["DEALER_MANAGER", "DEALER_STAFF"];
const ADMIN_ROLES = ["ADMIN"];

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#000000",
            borderRadius: "999px",
            padding: "10px 24px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.15)",
            border: "1px solid #e5e7eb",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#16a34a",
              secondary: "#ffffff",
            },
          },
          error: {
            duration: 3000,
            iconTheme: {
              primary: "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <DebugAuth />
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forbidden" element={<Forbidden />} />

        {/* Admin - Now part of Manufacturer */}
        {/* <Route path="/admin/ManageUsers" element={<ManageUsers />} /> */}

        {/* Dealer */}
        <Route
          path="/dealer/dashboard"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <DealerDashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/catalog"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <VehicleCatalog />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/vehicle-list"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <VehicleList />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/vehicle-detail/:modelId"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <VehicleDetail />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/cart"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <Cart />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/create-order"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <CreateOrder />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/comparison"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <VehicleComparison />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/orders"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <ManageOrders />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/orders/:id"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <OrderDetail />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/inventory"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <Inventory />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/vehicles"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <ManageVehicles />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/customers"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <ManageCustomers />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/vehicle-prices"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <VehiclePriceManagement />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/warranty"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <WarrantyManagement />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/customer-history"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <CustomerHistory />
            </AuthGuard>
          }
        />
        <Route
          path="/dealer/sales-report"
          element={
            <AuthGuard allowedRoles={DEALER_ROLES}>
              <SalesReport />
            </AuthGuard>
          }
        />

        {/* EVM */}
        <Route
          path="/evm/ManageDealers"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManageDealers />
            </AuthGuard>
          }
        />

        {/* Manufacturer */}
        <Route
          path="/manufacturer/reports"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <Reports />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/dealerManagement"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <DealerManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/priceTable"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <PriceTable />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/permissions"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <PermissionManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/dealer-levels"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <DealerLevels />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/users"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <ManageUsers />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/orders"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <OrderManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/warranty-requests"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <WarrantyRequests />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/colors"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <AdminColorManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-models"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <VehicleModels />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-instances"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <VehicleInstances />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/inventories"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <Inventories />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-models/:modelId/colors"
          element={
            <AuthGuard allowedRoles={ADMIN_ROLES}>
              <ManufacturerLayout>
                <VehicleModelColors />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />

        {/* Redirect manufacturer root to Reports */}
        <Route
          path="/manufacturer"
          element={<Navigate to="/manufacturer/reports" replace />}
        />

        {/* Default route (fallback) */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
