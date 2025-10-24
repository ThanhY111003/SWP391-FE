// src/pages/components/AdminLayout.jsx
import { Layout, Menu, Dropdown, Avatar, Space, Button } from "antd";
import { useNavigate } from "react-router-dom";
import {
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }) {
  const navigate = useNavigate();

  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';
  const role = typeof window !== 'undefined' ? localStorage.getItem('role') : '';

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleDropdownClick = ({ key }) => {
    if (key === "logout") {
      localStorage.clear();
      navigate("/login");
    } else if (key === "profile") {
      navigate("/admin/profile");
    }
  };

  const dropdownMenu = (
    <Menu onClick={handleDropdownClick}>
      <Menu.Item key="profile">Profile</Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>Logout</Menu.Item>
    </Menu>
  );

  const menuItems = [
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Manage Users",
      path: "/admin/ManageUsers",
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
          Admin Portal
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["users"]}
          items={menuItems}
          onClick={handleClick}
        />
      </Sider>
      <Layout>
        <Header className="bg-white shadow px-6 text-lg font-semibold flex items-center justify-between">
          <div>Admin Management Portal</div>
          <div className="flex items-center gap-4">
            {username ? (
              <Dropdown overlay={dropdownMenu} trigger={["click"]}>
                <a onClick={(e) => e.preventDefault()} className="flex items-center gap-2">
                  <Space>
                    <Avatar style={{ backgroundColor: "#7265e6" }}>
                      {getInitials(username)}
                    </Avatar>
                    <div className="text-sm">
                      <div className="font-medium">{username}</div>
                      <div className="text-xs text-gray-500">{role}</div>
                    </div>
                  </Space>
                </a>
              </Dropdown>
            ) : (
              <Button type="link" onClick={() => navigate('/login')}>Login</Button>
            )}
          </div>
        </Header>
        <Content className="p-0 bg-gray-50 min-h-full">{children}</Content>
      </Layout>
    </Layout>
  );
}