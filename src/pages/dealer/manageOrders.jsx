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
  Card,
} from "antd";
import axios from "axios";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();

  //  Thêm: lưu bảng giá hiệu lực hiện tại
  const [priceTable, setPriceTable] = useState(null);

  //  1. Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/dealer/orders");
      if (res.data.success) {
        setOrders(res.data.data);
      }
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
          priceTable: "2025-Q4",
          unitPrice: 50000,
          totalPrice: 250000,
        },
        {
          id: 2,
          orderCode: "ORD-002",
          status: "Delivered",
          model: "Model B",
          quantity: 3,
          priceTable: "2025-Q4",
          unitPrice: 70000,
          totalPrice: 210000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  //  2. Fetch bảng giá hiệu lực từ Manufacturer
  const fetchPriceTable = async () => {
    try {
      // 🔹 Gọi API thật sau này: /api/manufacturer/pricetables/active
      const res = {
        data: {
          name: "Bảng giá Q4-2025",
          effectiveFrom: "2025-10-01",
          effectiveTo: "2025-12-31",
          items: [
            { model: "Model A", price: 50000 },
            { model: "Model B", price: 70000 },
            { model: "Model C", price: 90000 },
          ],
        },
      };
      setPriceTable(res.data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải bảng giá hiện hành!");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPriceTable(); // ✅ Gọi thêm API bảng giá
  }, []);

  //  3. Modal mở để thêm/sửa đơn
  const openModal = (record = null) => {
    setEditingOrder(record);
    if (record) form.setFieldsValue(record);
    else form.resetFields();
    setOpen(true);
  };

  //  4. Submit form tạo / sửa đơn
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // ✅ Nếu là tạo mới thì tự động áp dụng giá theo bảng giá hiện hành
      if (!editingOrder && priceTable) {
        const selected = priceTable.items.find(
          (i) => i.model === values.model
        );
        if (!selected) {
          message.error("Không tìm thấy model trong bảng giá!");
          return;
        }
        values.unitPrice = selected.price;
        values.totalPrice = values.quantity * selected.price;
        values.priceTable = priceTable.name;
        values.status = "Pending Approval";
      }

      if (editingOrder) {
        await apiClient.put(
          `/api/dealer/orders/${editingOrder.id}`,
          values
        );
        message.success("Update order successfully!");
      } else {
        await apiClient.post("/api/dealer/orders/create", values);
        message.success("Create order successfully!");
      }
      setOpen(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Error saving order!");
    }
  };

  //  5. Xóa đơn
  const handleDelete = async (id) => {
    try {
      await apiClient.delete(`/api/dealer/orders/${id}`);
      message.success("Delete order successfully!");
      fetchOrders();
    } catch (err) {
      console.error(err);
      message.error("Cannot delete order!");
    }
  };

  //  6. Render trạng thái đơn
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

  //  7. Cấu hình bảng
  const columns = [
    { title: "Order Code", dataIndex: "orderCode", key: "orderCode" },
    { title: "Model", dataIndex: "model", key: "model" },
    { title: "Quantity", dataIndex: "quantity", key: "quantity" },
    { title: "Unit Price ($)", dataIndex: "unitPrice", key: "unitPrice" }, // ✅ thêm đơn giá
    { title: "Total ($)", dataIndex: "totalPrice", key: "totalPrice" }, // ✅ thêm tổng tiền
    { title: "Price Table", dataIndex: "priceTable", key: "priceTable" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button onClick={() => openModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete this order?"
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
          <h2 className="text-2xl font-bold">Manage Orders</h2>
          <Button type="primary" onClick={() => openModal()}>
            + Create Order
          </Button>
        </div>

        {/* ✅ Hiển thị bảng giá đang hiệu lực */}
        {priceTable && (
          <Card className="mb-6" title={`📊 ${priceTable.name}`}>
            <p>
              Hiệu lực: {priceTable.effectiveFrom} → {priceTable.effectiveTo}
            </p>
            <ul className="list-disc ml-5">
              {priceTable.items.map((item, i) => (
                <li key={i}>
                  {item.model}: <strong>${item.price.toLocaleString()}</strong>
                </li>
              ))}
            </ul>
          </Card>
        )}

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
          title={editingOrder ? "Update Order" : "Create Order"}
          onOk={handleSubmit}
          okText="Save"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Order Code"
              name="orderCode"
              rules={[{ required: true, message: "Please enter order code!" }]}
            >
              <Input disabled={!!editingOrder} />
            </Form.Item>

            <Form.Item
              label="Car Model"
              name="model"
              rules={[{ required: true, message: "Please select a model!" }]}
            >
              {/* ✅ Danh sách model lấy từ bảng giá hiệu lực */}
              <Select placeholder="Select car model">
                {priceTable?.items.map((item) => (
                  <Option key={item.model} value={item.model}>
                    {item.model} (${item.price.toLocaleString()})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[{ required: true, message: "Please enter quantity!" }]}
            >
              <InputNumber min={1} max={50} className="w-full" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
