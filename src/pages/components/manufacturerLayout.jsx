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
  BgColorsOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function ManufacturerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    // Nhóm tính năng quản trị hãng (ưu tiên)
    {
      key: "dealer-management",
      icon: <TeamOutlined />,
      label: "Quản lý đại lý",
      path: "/manufacturer/dealerManagement",
    },
    // Đặt "Cấp đại lý" ngay cạnh "Đại lý" như yêu cầu
    {
      key: "dealer-levels",
      icon: <CrownOutlined />,
      label: "Quản lý cấp đại lý",
      path: "/manufacturer/dealer-levels",
    },
    {
      key: "user-management",
      icon: <UserOutlined />,
      label: "Quản lý người dùng",
      path: "/manufacturer/users",
    },
    {
      key: "permission-management",
      icon: <SafetyCertificateOutlined />,
      label: "Quản lý phân quyền",
      path: "/manufacturer/permissions",
    },
    {
      key: "order-management",
      icon: <FileTextOutlined />,
      label: "Quản lý đơn hàng",
      path: "/manufacturer/orders",
    },
    {
      key: "vehicle-models",
      icon: <CarOutlined />,
      label: "Quản lý Vehicle Models",
      path: "/manufacturer/vehicle-models",
    },
    {
      key: "vehicle-instances",
      icon: <CarOutlined />,
      label: "Danh sách xe vật lý",
      path: "/manufacturer/vehicle-instances",
    },
    {
      key: "color-management",
      icon: <BgColorsOutlined />,
      label: "Quản lý màu sắc",
      path: "/manufacturer/colors",
    },
    {
      key: "price-table",
      icon: <DollarCircleOutlined />,
      label: "Bảng giá",
      path: "/manufacturer/priceTable",
    },
    // Ngăn cách khu vực khác hệ
    { type: "divider" },
    // Liên kết sang portal đại lý (nếu cần)
    {
      key: "price-table1",
      icon: <FileTextOutlined />,
      label: "Dealer dashboard",
      path: "/dealer/dashboard",
    },
    { type: "divider" },
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
