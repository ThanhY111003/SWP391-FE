// src/pages/components/ManufacturerLayout.jsx
import { Layout, Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TeamOutlined,
  DollarCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  CrownOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function ManufacturerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: "dealer-management",
      icon: <TeamOutlined />,
      label: "Quản lý đại lý",
      path: "/manufacturer/dealerManagement",
    },
    {
      key: "user-management",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      path: "/manufacturer/users",
    },
    {
      key: "order-management",
      icon: <FileTextOutlined />,
      label: "Quản lý đơn hàng",
      path: "/manufacturer/orders",
    },
    {
      key: "dealer-levels",
      icon: <CrownOutlined />,
      label: "Quản lý cấp đại lý",
      path: "/manufacturer/dealer-levels",
    },
    {
      key: "price-table",
      icon: <DollarCircleOutlined />,
      label: "Bảng giá",
      path: "/manufacturer/priceTable",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      path: "/login",
    },
  ];

  const handleClick = (e) => {
    const item = menuItems.find((m) => m.key === e.key);
    if (!item) return;

    if (item.path === "/login") {
      localStorage.clear();
      navigate("/login");
    } else {
      navigate(item.path);
    }
  };

  const getSelectedKey = () => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find((item) => item.path === currentPath);
    // Default highlight first item when at /manufacturer root (handled by redirect as well)
    if (currentPath === "/manufacturer") return ["dealer-management"];
    return activeItem ? [activeItem.key] : [];
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
          Manufacturer Portal
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
        <Header
          className="bg-white shadow px-6 text-lg font-semibold flex items-center"
          style={{ color: "white" }}
        >
          Hệ thống quản lý hãng
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
    </Layout>
  );
}
