// src/pages/dealer/orderDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Table, Tag, Button, Descriptions, message, Steps } from "antd";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRole = localStorage.getItem("role");

  // Giả lập gọi API
  useEffect(() => {
    // Giả sử gọi API: GET /api/orders/{orderId}
    setTimeout(() => {
      setOrder({
        id: orderId,
        orderNumber: "ORD-2025-001",
        dealerName: "AutoCity Dealer",
        priceTable: "Price Period Q4-2025",
        createdAt: "2025-10-06",
        status: "In Transit",
        details: [
          { model: "Model A", quantity: 5, unitPrice: 20000 },
          { model: "Model B", quantity: 2, unitPrice: 35000 },
        ],
        vehicles: [
          { chassis: "CH001", engine: "EN001", status: "In Delivery" },
          { chassis: "CH002", engine: "EN002", status: "In Delivery" },
        ],
        payments: [
          { type: "Deposit", amount: 10000, date: "2025-10-02" },
          { type: "Final", amount: 50000, date: "2025-10-06" },
        ],
      });
      setLoading(false);
    }, 600);
  }, [orderId]);

  //Khai báo danh sách các bước trạng thái đơn hàng
  const statusSteps = ["New", "Pending Approval", "Processing", "In Transit", "Delivered", "Completed"];
  //Xác định bước hiện tại (dựa trên trạng thái của đơn hàng)
  const currentStep = order ? statusSteps.indexOf(order.status) : 0;

  if (loading) return <p className="text-center mt-10">Đang tải dữ liệu...</p>;

  const handleConfirmReceived = () => {
    message.success("✅ Xác nhận đã nhận xe thành công!");
    // TODO: Gọi API cập nhật trạng thái đơn hàng → Delivered
  };

  const columnsDetails = [
    { title: "Model", dataIndex: "model" },
    { title: "Số lượng", dataIndex: "quantity" },
    {
      title: "Giá (USD)",
      dataIndex: "unitPrice",
      render: (v) => v.toLocaleString(),
    },
  ];

  const columnsVehicles = [
    { title: "Số khung", dataIndex: "chassis" },
    { title: "Số máy", dataIndex: "engine" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status) => <Tag color="blue">{status}</Tag>,
    },
  ];

  const columnsPayments = [
    { title: "Loại thanh toán", dataIndex: "type" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v) => `$${v.toLocaleString()}`,
    },
    { title: "Ngày thanh toán", dataIndex: "date" },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card title={`Chi tiết đơn hàng #${order.orderNumber}`}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Đại lý">
            {order.dealerName}
          </Descriptions.Item>
          <Descriptions.Item label="Bảng giá">
            {order.priceTable}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {order.createdAt}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color="blue">{order.status}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Tiến trình xử lý đơn hàng">
        <Steps
          current={currentStep}
          items={statusSteps.map((s) => ({
            title: s,
          }))}
        />
      </Card>

      <Card title="Chi tiết sản phẩm">
        <Table
          columns={columnsDetails}
          dataSource={order.details}
          rowKey={(r) => r.model}
          pagination={false}
        />
      </Card>

      <Card title="Danh sách xe được phân bổ">
        <Table
          columns={columnsVehicles}
          dataSource={order.vehicles}
          rowKey={(r) => r.chassis}
          pagination={false}
        />
      </Card>

      <Card title="Thanh toán">
        <Table
          columns={columnsPayments}
          dataSource={order.payments}
          rowKey={(r, i) => i}
          pagination={false}
        />
      </Card>

      {/* Nút hành động cho Dealer Manager */}
      {userRole === "DEALER_MANAGER" && order.status === "In Transit" && (
        <div className="text-right">
          <Button type="primary" onClick={handleConfirmReceived}>
            Xác nhận đã nhận xe
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
