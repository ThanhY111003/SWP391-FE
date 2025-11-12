// src/pages/components/ManufacturerLayout.jsx
import {
  Layout,
  Menu,
  Modal,
  Descriptions,
  Tag,
  Space,
  Button,
  message,
} from "antd";
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
  MoreOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../config/axios";

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
    // Divider trước khi đăng xuất
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ color: "#ff4d4f" }} />,
      label: (
        <span style={{ color: "#ff4d4f", fontWeight: 600 }}>Đăng xuất</span>
      ),
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

  // State & fetch for current user info
  const [me, setMe] = useState(null);
  // removed refresh button -> loading state no longer needed
  // const [meLoading, setMeLoading] = useState(false);
  const [openProfileModal, setOpenProfileModal] = useState(false);

  const fetchMe = async () => {
    // setMeLoading(true);
    try {
      const res = await api.get("admin/users/me");
      const payload = res?.data;
      const data = payload?.data ?? payload;
      setMe(data || null);
    } catch (e) {
      console.error("Fetch /admin/users/me failed", e);
      message.error(
        e?.response?.data?.message || "Không tải được thông tin tài khoản"
      );
      // fallback from localStorage
      setMe(
        (prev) =>
          prev || {
            username: localStorage.getItem("username") || "",
            roles: localStorage.getItem("role")
              ? [localStorage.getItem("role")]
              : [],
          }
      );
    } finally {
      // setMeLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <Layout className="min-h-screen">
      <Sider
        className="sider-tight"
        theme="dark"
        style={{
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          paddingBottom: 0,
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
        {/* Bottom account summary */}
        <div
          style={{
            marginTop: "auto",
            padding: "12px 12px 0",
            borderTop: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <Space
            align="start"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <div style={{ color: "#fff", fontSize: 12, lineHeight: 1.4 }}>
              <div style={{ fontWeight: 600 }}>
                {me?.fullName || me?.username || "Tài khoản"}
              </div>
              <div style={{ opacity: 0.85 }}>
                {me?.email || "Chưa có email"}
              </div>
            </div>
            <Space>
              <Button
                size="small"
                type="text"
                icon={<MoreOutlined style={{ color: "#fff" }} />}
                onClick={() => setOpenProfileModal(true)}
              />
            </Space>
          </Space>
        </div>
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
      <Modal
        open={openProfileModal}
        title="Thông tin tài khoản"
        onCancel={() => setOpenProfileModal(false)}
        footer={null}
        width={560}
      >
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="Họ và tên">
            {me?.fullName || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {me?.username || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {me?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {me?.phoneNumber || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="CMND/CCCD">
            {me?.idNumber || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {me?.dateOfBirth
              ? new Date(me.dateOfBirth).toLocaleDateString()
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {me?.gender || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {me?.address || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={me?.active ? "green" : "default"}>
              {me?.active ? "Hoạt động" : "Ngừng"}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Vai trò">
            <Space wrap>
              {(me?.roles || []).length
                ? me.roles.map((r, i) => (
                    <Tag key={i} color="blue">
                      {String(r).replace(/^ROLE_/, "")}
                    </Tag>
                  ))
                : "-"}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Đại lý">
            {me?.dealerName ? (
              <Tag color="geekblue">{me.dealerName}</Tag>
            ) : (
              <Tag>EVM</Tag>
            )}
          </Descriptions.Item>
          {me?.dealerId != null && (
            <Descriptions.Item label="Dealer ID">
              {me.dealerId}
            </Descriptions.Item>
          )}
          {me?.id != null && (
            <Descriptions.Item label="User ID">{me.id}</Descriptions.Item>
          )}
        </Descriptions>
      </Modal>
    </Layout>
  );
}
