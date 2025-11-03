// src/pages/components/DealerLayout.jsx
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
  AppstoreOutlined,
  SwapOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  BgColorsOutlined, // New icon for colors
  ToolOutlined, // Icon for vehicle management
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function DealerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Dashboard",
      path: "/dealer/dashboard",
    },
    {
      key: "catalog",
      icon: <AppstoreOutlined />,
      label: "Vehicle Catalog",
      path: "/dealer/catalog",
    },
    {
      key: "vehicle-list",
      icon: <CarOutlined />,
      label: "Danh sách xe",
      path: "/dealer/vehicle-list",
    },
    {
      key: "comparison",
      icon: <SwapOutlined />,
      label: "Vehicle Comparison",
      path: "/dealer/comparison",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
      path: "/dealer/orders",
    },
    {
      key: "cart",
      icon: <ShoppingCartOutlined />,
      label: "Giỏ hàng",
      path: "/dealer/cart",
    },
    // {
    //   key: "inventory",
    //   icon: <CarOutlined />,
    //   label: "Inventory",
    //   path: "/dealer/inventory",
    // },
    {
      key: "vehicles",
      icon: <ToolOutlined />,
      label: "Quản lý xe",
      path: "/dealer/vehicles",
    },
    {
      key: "customers",
      icon: <TeamOutlined />,
      label: "Customers",
      path: "/dealer/customers",
    },
    // {
    //   key: "sales-report",
    //   icon: <BarChartOutlined />,
    //   label: "Sales Report",
    //   path: "/dealer/sales-report",
    // },
    // {
    //   key: "debt-report",
    //   icon: <ExclamationCircleOutlined />,
    //   label: "Debt Report",
    //   path: "/dealer/debt-report",
    // },
    // {
    //   key: "colors",
    //   icon: <BgColorsOutlined />,
    //   label: "Color Management",
    //   path: "/dealer/colors",
    // },
    {
      key: "staff",
      icon: <UserOutlined />,
      label: "Staff",
      path: "/dealer/staff",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      path: "/login",
    },
  ];

  const handleClick = (e) => {
    const item = menuItems.find((m) => m.key === e.key);
    if (item.path === "/login") {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  // Tìm menu item active dựa trên URL hiện tại
  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath);
    return activeItem ? [activeItem.key] : ["dashboard"];
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        theme="dark"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="text-white text-center py-4 font-bold text-xl">
          Dealer Portal
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={menuItems}
          onClick={handleClick}
        />
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header className="bg-white shadow px-6 text-lg font-semibold flex items-center">
          Agent management portal
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
