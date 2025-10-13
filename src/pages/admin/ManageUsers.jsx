import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchUsers = async () => {
    // BE API: GET /api/users
    //const res = await axios.get("http://localhost:8080/api/users");
    setUsers(res.data);
  };

  const handleCreateUser = async (values) => {
    // BE API: POST /api/users
    // Request: { username, email, role } → backend generate password, send email
    //await axios.post("http://localhost:8080/api/users", values);
    message.success("Account created successfully, email sent!");
    setOpen(false);
    fetchUsers();
  };

  useEffect(() => { fetchUsers(); }, []);

  const columns = [
    { title: "Username", dataIndex: "username" },
    { title: "Email", dataIndex: "email" },
    { title: "Role", dataIndex: "role" },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button type="primary" onClick={() => setOpen(true)}>+ Create New</Button>
      </div>

      <Table dataSource={users} columns={columns} rowKey="username" />

      <Modal
        open={open}
        title="Create New Account"
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateUser}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "EVM Staff", value: "EVM_STAFF" },
                { label: "Dealer Manager", value: "DEALER_MANAGER" },
                { label: "Dealer Staff", value: "DEALER_STAFF" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Create Account
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
