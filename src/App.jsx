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

        {/* Admin - Now part of Manufacturer */}
        {/* <Route path="/admin/ManageUsers" element={<ManageUsers />} /> */}

        {/* Dealer */}
        <Route path="/dealer/dashboard" element={<DealerDashboard />} />
        <Route path="/dealer/catalog" element={<VehicleCatalog />} />
        <Route path="/dealer/vehicle-list" element={<VehicleList />} />
        <Route
          path="/dealer/vehicle-detail/:modelId"
          element={<VehicleDetail />}
        />
        <Route path="/dealer/cart" element={<Cart />} />
        <Route path="/dealer/create-order" element={<CreateOrder />} />
        <Route path="/dealer/comparison" element={<VehicleComparison />} />
        <Route path="/dealer/orders" element={<ManageOrders />} />
        <Route path="/dealer/orders/:id" element={<OrderDetail />} />
        <Route path="/dealer/inventory" element={<Inventory />} />
        <Route path="/dealer/vehicles" element={<ManageVehicles />} />
        <Route path="/dealer/customers" element={<ManageCustomers />} />
        <Route
          path="/dealer/vehicle-prices"
          element={<VehiclePriceManagement />}
        />
        <Route path="/dealer/warranty" element={<WarrantyManagement />} />
        <Route path="/dealer/customer-history" element={<CustomerHistory />} />
        <Route path="/dealer/sales-report" element={<SalesReport />} />

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
          path="/manufacturer/reports"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <Reports />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
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
          path="/manufacturer/permissions"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <PermissionManagement />
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
        <Route
          path="/manufacturer/warranty-requests"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <WarrantyRequests />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/colors"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <AdminColorManagement />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-models"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <VehicleModels />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-instances"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <VehicleInstances />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/inventories"
          element={
            <AuthGuard>
              <ManufacturerLayout>
                <Inventories />
              </ManufacturerLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/manufacturer/vehicle-models/:modelId/colors"
          element={
            <AuthGuard>
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
