// src/pages/dealer/manageStaff.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
} from "antd";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;

export default function ManageStaff() {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  // 🧩 1. Load danh sách nhân viên
  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/dealer/staff");
      if (res.data.success) {
        setStaffs(res.data.data);
      }
    } catch (err) {
      console.error(err);
      // Mock data nếu chưa có API
      setStaffs([
        {
          id: 1,
          username: "dealer_staff_1",
          email: "staff1@dealer.com",
          role: "DEALER_STAFF",
        },
        {
          id: 2,
          username: "dealer_staff_2",
          email: "staff2@dealer.com",
          role: "DEALER_STAFF",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // 🧩 2. Xử lý mở modal (thêm/sửa)
  const openModal = (record = null) => {
    setEditingStaff(record);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setOpen(true);
  };

  // 🧩 3. Gửi dữ liệu khi nhấn Save
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingStaff) {
        // update
        await apiClient.put(`/api/dealer/staff/${editingStaff.id}`, values);
        message.success("Update staff successfully!");
      } else {
        // create
        await apiClient.post("/api/dealer/staff", values);
        message.success("Create staff successfully!");
      }

      setOpen(false);
      fetchStaffs();
    } catch (err) {
      console.error(err);
      message.error("Error occurred, please try again!");
    }
  };

  // 🧩 4. Xóa nhân viên
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/dealer/staff/${id}`);
      message.success("Delete staff successfully!");
      fetchStaffs();
    } catch (err) {
      console.error(err);
      message.error("Cannot delete staff!");
    }
  };

  // 🧩 5. Cấu hình cột Table
  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm
            title="Are you sure you want to delete this staff?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Manage Dealer Staff</h2>
          <Button type="primary" onClick={() => openModal()}>
            + Add Staff
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={staffs}
          loading={loading}
          bordered
        />

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          title={editingStaff ? "Update Staff" : "Add New Staff"}
          onOk={handleSubmit}
          okText="Save"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Please enter username!" }]}
            >
              <Input disabled={!!editingStaff} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Please enter email!" },
                { type: "email", message: "Invalid email!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Please select role!" }]}
            >
              <Select>
                <Option value="DEALER_STAFF">DEALER_STAFF</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
