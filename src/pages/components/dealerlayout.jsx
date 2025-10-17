// src/pages/components/DealerLayout.jsx
import { Layout, Menu } from "antd";
import { useNavigate } from "react-router-dom";
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
  BgColorsOutlined,  // New icon for colors
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function DealerLayout({ children }) {
  const navigate = useNavigate();

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
      key: "inventory",
      icon: <CarOutlined />,
      label: "Inventory",
      path: "/dealer/inventory",
    },
    {
      key: "customers",
      icon: <TeamOutlined />,
      label: "Customers",
      path: "/dealer/customers",
    },
    {
      key: "sales-report",
      icon: <BarChartOutlined />,
      label: "Sales Report",
      path: "/dealer/sales-report",
    },
    {
      key: "debt-report",
      icon: <ExclamationCircleOutlined />,
      label: "Debt Report",
      path: "/dealer/debt-report",
    },
    {
      key: "colors",
      icon: <BgColorsOutlined />,
      label: "Color Management",
      path: "/dealer/colors",
    },
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

  return (
    <Layout className="min-h-screen">
      <Sider theme="dark">
        <div className="text-white text-center py-4 font-bold text-xl">
          Dealer Portal
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          items={menuItems}
          onClick={handleClick}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow px-6 text-lg font-semibold flex items-center">
          Agent management portal
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
