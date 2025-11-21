// src/pages/components/DealerLayout.jsx
import { Layout, Menu, Space, Button, Modal, Descriptions, Tag } from "antd";
import toast from "react-hot-toast";
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
  DollarOutlined, // Icon for price management
  SafetyOutlined, // Icon for warranty management
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import api from "../../config/axios";

const { Header, Sider, Content } = Layout;

export default function DealerLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Thông tin tài khoản đại lý
  const [me, setMe] = useState(null);
  const [dealer, setDealer] = useState(null);
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingValues, setEditingValues] = useState({});

  const fetchMe = async () => {
    try {
      // Tạm dùng chung endpoint với admin để lấy profile
      const res = await api.get("admin/users/me");
      const payload = res?.data;
      const data = payload?.data ?? payload;
      setMe(data || null);
      setEditingValues(data || {});

      // Nếu user có dealerId thì lấy thêm thông tin chi tiết dealer
      if (data?.dealerId) {
        try {
          const dealerRes = await api.get(`/dealers/${data.dealerId}`);
          const dealerPayload = dealerRes?.data;
          const dealerData = dealerPayload?.data ?? dealerPayload;
          setDealer(dealerData || null);
        } catch (err) {
          console.error("Fetch dealer detail failed", err);
        }
      } else {
        setDealer(null);
      }
    } catch (e) {
      console.error("Fetch /admin/users/me failed", e);
      const errorMsg =
        e?.response?.data?.message || "Không tải được thông tin tài khoản";
      toast.error(errorMsg);
      setMe(
        (prev) =>
          prev || {
            username: localStorage.getItem("username") || "",
            roles: localStorage.getItem("role")
              ? [localStorage.getItem("role")]
              : [],
          }
      );
      setDealer(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handleOpenProfile = () => {
    if (me) {
      setEditingValues(me);
    }
    setEditing(false);
    setOpenProfileModal(true);
  };

  const handleChangeField = (field, value) => {
    setEditingValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        username: editingValues.username,
        email: editingValues.email,
        fullName: editingValues.fullName,
        phoneNumber: editingValues.phoneNumber,
        idNumber: editingValues.idNumber,
        dateOfBirth: editingValues.dateOfBirth,
        gender: editingValues.gender,
        address: editingValues.address,
      };
      await api.put("admin/users/me", payload);
      toast.success("Cập nhật thông tin tài khoản thành công!");
      setMe((prev) => ({ ...(prev || {}), ...editingValues }));
      setEditing(false);
    } catch (e) {
      console.error("Update /admin/users/me failed", e);
      const errorMsg =
        e?.response?.data?.message ||
        "Cập nhật thông tin tài khoản thất bại. Vui lòng thử lại!";
      toast.error(errorMsg);
    }
  };

  const menuItems = [
    {
      key: "dashboard",
      icon: <HomeOutlined />,
      label: "Thống kê",
      path: "/dealer/dashboard",
    },
    {
      key: "vehicle-prices",
      icon: <DollarOutlined />,
      label: "Bảng giá",
      path: "/dealer/vehicle-prices",
    },
    // {
    //   key: "catalog",
    //   icon: <AppstoreOutlined />,
    //   label: "Vehicle Catalog",
    //   path: "/dealer/catalog",
    // },
    {
      key: "vehicle-list",
      icon: <CarOutlined />,
      label: "Danh sách xe",
      path: "/dealer/vehicle-list",
    },
    {
      key: "comparison",
      icon: <SwapOutlined />,
      label: "So sánh xe",
      path: "/dealer/comparison",
    },
    {
      key: "cart",
      icon: <ShoppingCartOutlined />,
      label: "Giỏ hàng",
      path: "/dealer/cart",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn hàng",
      path: "/dealer/orders",
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
      key: "warranty",
      icon: <SafetyOutlined />,
      label: "Bảo hành",
      path: "/dealer/warranty",
    },
    {
      key: "customers",
      icon: <TeamOutlined />,
      label: "Khách hàng",
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
    // {
    //   key: "staff",
    //   icon: <UserOutlined />,
    //   label: "Staff",
    //   path: "/dealer/staff",
    // },
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
          overflow: "hidden",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
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
            style={{ flex: 1, overflowY: "auto" }}
          />
          {/* Thông tin tài khoản dưới cùng, giống trang admin */}
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
                  icon={<UserOutlined style={{ color: "#fff" }} />}
                  onClick={handleOpenProfile}
                />
              </Space>
            </Space>
          </div>
        </div>
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header className="bg-white shadow px-6 text-lg font-semibold flex items-center">
          Agent management portal
        </Header>
        <Content className="p-6 bg-gray-50">{children}</Content>
      </Layout>
      <Modal
        open={openProfileModal}
        title="Thông tin tài khoản"
        onCancel={() => {
          setOpenProfileModal(false);
          setEditing(false);
        }}
        footer={[
          editing ? (
            <Button key="cancel" onClick={() => setEditing(false)}>
              Hủy
            </Button>
          ) : (
            <Button key="edit" type="primary" onClick={() => setEditing(true)}>
              Chỉnh sửa
            </Button>
          ),
          editing && (
            <Button key="save" type="primary" onClick={handleSaveProfile}>
              Lưu
            </Button>
          ),
        ]}
        width={560}
      >
        <Descriptions bordered column={1} size="small">
          {me?.id != null && (
            <Descriptions.Item label="User ID">{me.id}</Descriptions.Item>
          )}
          <Descriptions.Item label="Họ và tên">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.fullName || ""}
                onChange={(e) => handleChangeField("fullName", e.target.value)}
              />
            ) : (
              me?.fullName || "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {me?.username || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.email || ""}
                onChange={(e) => handleChangeField("email", e.target.value)}
              />
            ) : (
              me?.email || "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.phoneNumber || ""}
                onChange={(e) =>
                  handleChangeField("phoneNumber", e.target.value)
                }
              />
            ) : (
              me?.phoneNumber || "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="CMND/CCCD">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.idNumber || ""}
                onChange={(e) => handleChangeField("idNumber", e.target.value)}
              />
            ) : (
              me?.idNumber || "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">
            {editing ? (
              <input
                type="date"
                style={{ width: "100%" }}
                value={editingValues.dateOfBirth || ""}
                onChange={(e) =>
                  handleChangeField("dateOfBirth", e.target.value)
                }
              />
            ) : me?.dateOfBirth ? (
              new Date(me.dateOfBirth).toLocaleDateString()
            ) : (
              "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Giới tính">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.gender || ""}
                onChange={(e) => handleChangeField("gender", e.target.value)}
              />
            ) : (
              me?.gender || "-"
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            {editing ? (
              <input
                style={{ width: "100%" }}
                value={editingValues.address || ""}
                onChange={(e) => handleChangeField("address", e.target.value)}
              />
            ) : (
              me?.address || "-"
            )}
          </Descriptions.Item>
          {/* Thông tin đại lý (chỉ xem, không cho dealer chỉnh sửa) */}
          {me?.dealerId != null && (
            <>
              <Descriptions.Item label="Dealer ID">
                {me.dealerId}
              </Descriptions.Item>
              <Descriptions.Item label="Tên đại lý">
                {dealer?.name || me?.dealerName || me?.dealer?.name || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đại lý">
                {dealer?.code || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ đại lý">
                {dealer?.address || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại đại lý">
                {dealer?.phoneNumber || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Email đại lý">
                {dealer?.email || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Khu vực">
                {dealer?.region || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp đại lý">
                {dealer?.dealerLevelName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Công nợ hiện tại (VNĐ)">
                {typeof dealer?.currentDebt === "number"
                  ? dealer.currentDebt.toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn mức còn lại (VNĐ)">
                {typeof dealer?.availableCredit === "number"
                  ? dealer.availableCredit.toLocaleString("vi-VN")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Số đơn tối đa mỗi đợt đặt">
                {dealer?.maxOrderQuantity ?? "-"}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="Vai trò">
            {Array.isArray(me?.roles) && me.roles.length ? (
              <Space wrap>
                {me.roles.map((r, i) => (
                  <Tag key={i} color="blue">
                    {String(r).replace(/^ROLE_/, "")}
                  </Tag>
                ))}
              </Space>
            ) : (
              localStorage.getItem("role") || "-"
            )}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </Layout>
  );
}
