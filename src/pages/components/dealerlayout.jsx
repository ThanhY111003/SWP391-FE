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
      key: "staff",
      icon: <TeamOutlined />,
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
    }
    navigate(item.path);
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
