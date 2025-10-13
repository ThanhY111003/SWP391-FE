import { Table, Button, Modal, Form, Input, Select, message } from "antd";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ManageDealers() {
  const [dealers, setDealers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const fetchDealers = async () => {
    // BE API: GET /api/users?role=dealer
    //const res = await axios.get("http://localhost:8080/api/users?role=dealer");
    setDealers(res.data);
  };

  const handleCreate = async (values) => {
    // BE API: POST /api/users
    // Request: { username, email, role: DEALER_MANAGER or DEALER_STAFF }
    //await axios.post("http://localhost:8080/api/users", values);
    message.success("Created dealer account successfully!");
    setOpen(false);
    fetchDealers();
  };

  useEffect(() => { fetchDealers(); }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Dealer Account Management</h2>
        <Button type="primary" onClick={() => setOpen(true)}>+ Create account</Button>
      </div>
      <Table dataSource={dealers} columns={[
        { title: "Username", dataIndex: "username" },
        { title: "Email", dataIndex: "email" },
        { title: "Role", dataIndex: "role" },
      ]} rowKey="username" />

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Create Dealer Account"
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="Role" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Dealer Manager", value: "DEALER_MANAGER" },
                { label: "Dealer Staff", value: "DEALER_STAFF" },
              ]}
            />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="w-full">
            Tạo
          </Button>
        </Form>
      </Modal>
    </div>
  );
}
