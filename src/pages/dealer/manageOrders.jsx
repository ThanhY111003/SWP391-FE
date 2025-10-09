// src/pages/dealer/manageOrders.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  Input,
  Tag,
  message,
  Popconfirm,
} from "antd";
import axios from "axios";
import DealerLayout from "../components/dealerlayout";

const { Option } = Select;

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();

  // 🧩 1. Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/dealer/orders");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      // Mock data khi BE chưa có
      setOrders([
        {
          id: 1,
          orderCode: "ORD-001",
          status: "Pending Approval",
          model: "Model A",
          quantity: 5,
          priceTable: "2025-Q1",
        },
        {
          id: 2,
          orderCode: "ORD-002",
          status: "Delivered",
          model: "Model B",
          quantity: 3,
          priceTable: "2025-Q1",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 🧩 2. Modal mở để thêm/sửa đơn
  const openModal = (record = null) => {
    setEditingOrder(record);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setOpen(true);
  };

  // 🧩 3. Submit form tạo / sửa đơn
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingOrder) {
        await axios.put(
          `http://localhost:8080/api/dealer/orders/${editingOrder.id}`,
          values
        );
        message.success("Cập nhật đơn hàng thành công!");
      } else {
        await axios.post("http://localhost:8080/api/dealer/orders", values);
        message.success("Tạo đơn hàng thành công!");
      }
      setOpen(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi lưu đơn hàng!");
    }
  };

  // 🧩 4. Xóa đơn
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/dealer/orders/${id}`);
      message.success("Xóa đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Không thể xóa đơn hàng!");
    }
  };

  // 🧩 5. Render trạng thái đơn
  const renderStatus = (status) => {
    const colorMap = {
      New: "blue",
      "Pending Approval": "orange",
      Processing: "gold",
      "In Transit": "purple",
      Delivered: "green",
      Completed: "cyan",
    };
    return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
  };

  // 🧩 6. Cấu hình bảng
  const columns = [
    { title: "Mã đơn", dataIndex: "orderCode", key: "orderCode" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "Số lượng", dataIndex: "quantity", key: "quantity" },
    { title: "Bảng giá", dataIndex: "priceTable", key: "priceTable" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button onClick={() => openModal(record)}>Sửa</Button>
          <Popconfirm
            title="Xóa đơn hàng này?"
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
          <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
          <Button type="primary" onClick={() => openModal()}>
            + Tạo đơn hàng
          </Button>
        </div>

        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          bordered
        />

        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          title={editingOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
          onOk={handleSubmit}
          okText="Lưu"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Mã đơn hàng"
              name="orderCode"
              rules={[{ required: true, message: "Nhập mã đơn hàng!" }]}
            >
              <Input disabled={!!editingOrder} />
            </Form.Item>

            <Form.Item
              label="Model xe"
              name="model"
              rules={[{ required: true, message: "Chọn model!" }]}
            >
              <Select>
                <Option value="Model A">Model A</Option>
                <Option value="Model B">Model B</Option>
                <Option value="Model C">Model C</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[{ required: true, message: "Nhập số lượng!" }]}
            >
              <InputNumber min={1} max={50} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Bảng giá"
              name="priceTable"
              rules={[{ required: true, message: "Chọn bảng giá!" }]}
            >
              <Select>
                <Option value="2025-Q1">2025-Q1</Option>
                <Option value="2025-Q2">2025-Q2</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
