import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  DatePicker,
} from "antd";
import { useState, useEffect } from "react";
import api from "../../config/axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [dealers, setDealers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // BE API: GET /api/users
      const res = await api.get("admin/users/get-all-users");
      console.log("API Response:", res.data); // Debug log

      // Đảm bảo users luôn là array
      if (res.data && Array.isArray(res.data)) {
        console.log("Using direct array format");
        setUsers(res.data);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        // Nếu response có format { data: [...] }
        console.log("Using res.data.data format");
        setUsers(res.data.data);
      } else if (
        res.data &&
        res.data.success &&
        res.data.data &&
        Array.isArray(res.data.data)
      ) {
        // Nếu response có format { success: true, data: [...] }
        console.log("Using success format");
        setUsers(res.data.data);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setUsers([]); // Fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load users";
      message.error(errorMessage);
      setUsers([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    // try {
    //   const res = await api.get("evm/dealers");
    //   if (res.data && Array.isArray(res.data)) {
    //     setDealers(res.data);
    //   } else if (res.data?.data) {
    //     setDealers(res.data.data);
    //   }
    // } catch (error) {
    //   console.error("Error fetching dealers:", error);
    // }
  };

  const handleCreateUser = async (values) => {
    try {
      // Format dateOfBirth to ISO string if it exists
      const formattedValues = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : null,
        // Convert single roleName to match API
        roleName: values.roleName,
        dealerId: values.dealerId || 0, // Default to 0 if not provided
      };

      // Remove roles field if exists (use roleName instead)
      delete formattedValues.roles;

      console.log("Sending data:", formattedValues);

      await api.post("admin/users/create-users", formattedValues);
      message.success("Tạo tài khoản thành công! Email đã được gửi.");
      form.resetFields();
      setOpen(false);
      setSelectedRole(null);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDealers();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Roles",
      dataIndex: "roles",
      render: (roles) => (
        <Space wrap>
          {Array.isArray(roles) ? (
            roles.map((role, index) => (
              <Tag key={index} color="blue">
                {role.replace("ROLE_", "")}
              </Tag>
            ))
          ) : (
            <Tag color="default">No roles</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "active",
      render: (active, record) => (
        <Space direction="vertical" size="small">
          <Tag color={active ? "green" : "red"}>
            {active ? "Active" : "Inactive"}
          </Tag>
          {record.verified && <Tag color="blue">Verified</Tag>}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button type="primary" onClick={() => setOpen(true)}>
          + Create New
        </Button>
      </div>

      <Table
        dataSource={users || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: 800 }}
        size="middle"
      />

      <Modal
        open={open}
        title="Create New Account"
        onCancel={() => {
          setOpen(false);
          setSelectedRole(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{
            gender: "MALE",
            dealerId: 0,
          }}
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập địa chỉ email" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="idNumber"
            label="Số CMND/CCCD"
            rules={[{ required: true, message: "Vui lòng nhập số CMND/CCCD!" }]}
          >
            <Input placeholder="Nhập số CMND/CCCD" />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
          >
            <DatePicker
              className="w-full"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <Select placeholder="Chọn giới tính">
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="roleName"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select
              placeholder="Chọn vai trò"
              onChange={(value) => setSelectedRole(value)}
              options={[
                { label: "EVM Staff", value: "EVM_STAFF" },
                { label: "Dealer Manager", value: "DEALER_MANAGER" },
                { label: "Dealer Staff", value: "DEALER_STAFF" },
              ]}
            />
          </Form.Item>

          {(selectedRole === "DEALER_MANAGER" ||
            selectedRole === "DEALER_STAFF") && (
            <Form.Item
              name="dealerId"
              label="Dealer"
              rules={[{ required: true, message: "Vui lòng chọn dealer!" }]}
            >
              <Select
                placeholder="Chọn dealer"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                {dealers.map((dealer) => (
                  <Select.Option
                    key={dealer.id}
                    value={dealer.id}
                    label={dealer.dealerName}
                  >
                    {dealer.dealerName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            size="large"
          >
            Tạo tài khoản
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
