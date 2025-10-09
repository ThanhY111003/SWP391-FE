// src/pages/dealer/manageStaff.jsx
import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm } from "antd";
import axios from "axios";
import DealerLayout from "../components/dealerlayout";

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
      const res = await axios.get("http://localhost:8080/api/dealer/staff");
      setStaffs(res.data);
    } catch (err) {
      console.error(err);
      // Mock data nếu chưa có API
      setStaffs([
        { id: 1, username: "dealer_staff_1", email: "staff1@dealer.com", role: "DEALER_STAFF" },
        { id: 2, username: "dealer_staff_2", email: "staff2@dealer.com", role: "DEALER_STAFF" },
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
        await axios.put(`http://localhost:8080/api/dealer/staff/${editingStaff.id}`, values);
        message.success("Cập nhật nhân viên thành công!");
      } else {
        // create
        await axios.post("http://localhost:8080/api/dealer/staff", values);
        message.success("Tạo nhân viên mới thành công!");
      }

      setOpen(false);
      fetchStaffs();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  // 🧩 4. Xóa nhân viên
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/dealer/staff/${id}`);
      message.success("Xóa nhân viên thành công!");
      fetchStaffs();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa nhân viên!");
    }
  };

  // 🧩 5. Cấu hình cột Table
  const columns = [
    { title: "Username", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button onClick={() => openModal(record)}>Sửa</Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa nhân viên này không?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quản lý nhân viên đại lý</h2>
          <Button type="primary" onClick={() => openModal()}>
            + Thêm nhân viên
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
          title={editingStaff ? "Cập nhật nhân viên" : "Thêm nhân viên mới"}
          onOk={handleSubmit}
          okText="Lưu"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: "Nhập username!" }]}
            >
              <Input disabled={!!editingStaff} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role"
              rules={[{ required: true, message: "Chọn role!" }]}
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
