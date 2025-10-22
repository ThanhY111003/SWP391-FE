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
import api from "../../config/axios";
import DealerLayout from "../components/dealerlayout";

const { Option } = Select;

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();

  //  Thêm: lưu bảng giá hiệu lực hiện tại
  const [priceTable, setPriceTable] = useState(null);

  //  1. Fetch danh sách đơn hàng từ database
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const res = await api.get("/dealer/orders");
      console.log("API Response:", res.data);

      // API trả về format: { success: true, data: [...] }
      if (res.data && res.data.success && res.data.data) {
        setOrders(res.data.data);
        console.log(
          "Orders loaded from database:",
          res.data.data.length,
          "orders"
        );
      } else {
        console.log("No data received from API");
        setOrders([]);
      }
    } catch (err) {
      console.log("API not available, using mock data:", err.message);
      // Fallback về mock data khi API chưa sẵn sàng
      setOrders([
        {
          id: 1,
          orderCode: "ORD-001",
          status: "PENDING",
          totalAmount: 250000000,
          depositAmount: 50000000,
          paidAmount: 50000000,
          remainingAmount: 200000000,
          paymentProgress: 20,
          isInstallment: true,
          orderDate: "2025-01-15",
          notes: "Đơn hàng test từ mock data",
          dealer: {
            id: 1,
            name: "Dealer ABC",
            code: "DL001",
            levelName: "Gold",
          },
          createdBy: {
            username: "staff001",
            fullName: "Nguyễn Văn A",
          },
          orderDetails: [
            {
              id: 1,
              vehicleModelName: "Model A",
              vehicleColorName: "Đỏ",
              quantity: 5,
              unitPrice: 50000000,
              totalPrice: 250000000,
            },
          ],
        },
        {
          id: 2,
          orderCode: "ORD-002",
          status: "DELIVERED",
          totalAmount: 210000000,
          depositAmount: 210000000,
          paidAmount: 210000000,
          remainingAmount: 0,
          paymentProgress: 100,
          isInstallment: false,
          orderDate: "2025-01-10",
          notes: "Thanh toán đầy đủ",
          dealer: {
            id: 1,
            name: "Dealer ABC",
            code: "DL001",
            levelName: "Gold",
          },
          createdBy: {
            username: "staff002",
            fullName: "Trần Thị B",
          },
          orderDetails: [
            {
              id: 2,
              vehicleModelName: "Model B",
              vehicleColorName: "Xanh",
              quantity: 3,
              unitPrice: 70000000,
              totalPrice: 210000000,
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  //  2. Fetch bảng giá hiệu lực từ Manufacturer
  const fetchPriceTable = async () => {
    try {
      const res = await api.get("/manufacturer/pricetables/active");
      console.log("Price table API Response:", res.data);

      if (res.data && res.data.success && res.data.data) {
        setPriceTable(res.data.data);
        console.log("Price table loaded from database");
      } else {
        console.log("No price table data received from API");
        setPriceTable(null);
      }
    } catch (err) {
      console.log(
        "Price table API not available, using mock data:",
        err.message
      );
      // Fallback về mock data khi API chưa sẵn sàng
      setPriceTable({
        name: "Bảng giá Q4-2025 (Mock Data)",
        effectiveFrom: "2025-10-01",
        effectiveTo: "2025-12-31",
        items: [
          { model: "Model A", price: 50000000 },
          { model: "Model B", price: 70000000 },
          { model: "Model C", price: 90000000 },
        ],
      });
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
      if (!editingOrder && priceTable && priceTable.items) {
        const selected = priceTable.items.find(
          (i) => (i.model || i.vehicleModelName) === values.model
        );
        if (!selected) {
          message.error("Không tìm thấy model trong bảng giá!");
          return;
        }
        values.unitPrice = selected.price;
        values.totalPrice = values.quantity * selected.price;
        values.priceTable = priceTable.name;
        values.status = "PENDING";
      }

      if (editingOrder) {
        // Update existing order
        try {
          const res = await api.put(
            `/dealer/orders/${editingOrder.id}`,
            values
          );
          if (res.data && res.data.success) {
            message.success("Cập nhật đơn hàng thành công!");
          } else {
            message.error("Cập nhật đơn hàng thất bại!");
          }
        } catch (err) {
          console.log(
            "Update API not available, updating locally:",
            err.message
          );
          // Fallback: cập nhật local state
          setOrders((prev) =>
            prev.map((order) =>
              order.id === editingOrder.id ? { ...order, ...values } : order
            )
          );
          message.success("Cập nhật đơn hàng thành công (chế độ offline)!");
        }
      } else {
        // Create new order
        try {
          const res = await api.post("/dealer/orders", values);
          if (res.data && res.data.success) {
            message.success("Tạo đơn hàng thành công!");
          } else {
            message.error("Tạo đơn hàng thất bại!");
          }
        } catch (err) {
          console.log(
            "Create API not available, creating locally:",
            err.message
          );
          // Fallback: thêm vào local state
          const newOrder = {
            id: Date.now(), // Temporary ID
            ...values,
            status: "PENDING",
            orderDate: new Date().toISOString().split("T")[0],
            createdBy: {
              username: localStorage.getItem("username") || "current_user",
              fullName: "Current User",
            },
            orderDetails: [
              {
                id: Date.now(),
                vehicleModelName: values.model,
                vehicleColorName: "Default",
                quantity: values.quantity,
                unitPrice: values.unitPrice,
                totalPrice: values.totalPrice,
              },
            ],
          };
          setOrders((prev) => [...prev, newOrder]);
          message.success("Tạo đơn hàng thành công (chế độ offline)!");
        }
      }
      setOpen(false);
      fetchOrders(); // Reload data
    } catch (err) {
      console.log("Form validation failed:", err.message);
      message.error("Please check your input!");
    }
  };

  //  5. Xóa đơn
  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/dealer/orders/${id}`);
      if (res.data && res.data.success) {
        message.success("Xóa đơn hàng thành công!");
        fetchOrders(); // Reload data from database
      } else {
        message.error("Xóa đơn hàng thất bại!");
      }
    } catch (err) {
      console.log("Delete API not available, deleting locally:", err.message);
      // Fallback: xóa khỏi local state
      setOrders((prev) => prev.filter((order) => order.id !== id));
      message.success("Xóa đơn hàng thành công (chế độ offline)!");
    }
  };

  //  6. Render trạng thái đơn
  const renderStatus = (status) => {
    const colorMap = {
      PENDING: "orange",
      PROCESSING: "gold",
      IN_TRANSIT: "purple",
      DELIVERED: "green",
      COMPLETED: "cyan",
      CANCELLED: "red",
    };
    return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
  };

  //  7. Cấu hình bảng
  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      width: 120,
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
    },
    {
      title: "Vehicle Details",
      key: "vehicleDetails",
      render: (_, record) => {
        const details = record.orderDetails || [];
        return (
          <div>
            {details.map((detail, index) => (
              <div key={index} className="text-sm">
                <div>
                  {detail.vehicleModelName} - {detail.vehicleColorName}
                </div>
                <div className="text-gray-500">Qty: {detail.quantity}</div>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: "Total Amount (VND)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => amount?.toLocaleString("vi-VN"),
      width: 150,
    },
    {
      title: "Payment Progress",
      key: "paymentProgress",
      render: (_, record) => (
        <div>
          <div className="text-sm">{record.paymentProgress}%</div>
          <div className="text-xs text-gray-500">
            {record.paidAmount?.toLocaleString("vi-VN")} /{" "}
            {record.totalAmount?.toLocaleString("vi-VN")}
          </div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
      width: 100,
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.createdBy?.fullName}</div>
          <div className="text-gray-500">{record.createdBy?.username}</div>
        </div>
      ),
      width: 120,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="space-x-2">
          <Button size="small" onClick={() => openModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete this order?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
      width: 120,
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Manage Orders</h2>
            <p className="text-sm text-gray-500 mt-1">
              💡 Đang sử dụng dữ liệu demo - API backend chưa sẵn sàng
            </p>
          </div>
          <Button type="primary" onClick={() => openModal()}>
            + Create Order
          </Button>
        </div>

        {/* ✅ Hiển thị bảng giá đang hiệu lực */}
        {priceTable && (
          <Card
            className="mb-6"
            title={`📊 ${priceTable.name || "Bảng giá hiện hành"}`}
          >
            <p>
              Hiệu lực: {priceTable.effectiveFrom} → {priceTable.effectiveTo}
            </p>
            <ul className="list-disc ml-5">
              {priceTable.items &&
                priceTable.items.map((item, i) => (
                  <li key={i}>
                    {item.model || item.vehicleModelName}:{" "}
                    <strong>{item.price?.toLocaleString("vi-VN")} VND</strong>
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
                {priceTable?.items &&
                  priceTable.items.map((item) => (
                    <Option
                      key={item.model || item.vehicleModelName}
                      value={item.model || item.vehicleModelName}
                    >
                      {item.model || item.vehicleModelName} (
                      {item.price?.toLocaleString("vi-VN")} VND)
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
