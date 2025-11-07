// src/pages/dealer/manageOrders.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Tag,
  message,
  Card,
  Descriptions,
  Space,
  Progress,
  Typography,
  Spin,
  Empty,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Text } = Typography;

export default function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  //  1. Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/dealer/orders");
      if (res.data.success) {
        setOrders(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách đơn hàng!");
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách đơn hàng!";
      message.error(errorMsg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  //  2. Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  //  3. Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      return "N/A";
    }
  };

  //  4. Render trạng thái đơn
  const renderStatus = (status) => {
    const colorMap = {
      PENDING: "orange",
      CONFIRMED: "blue",
      PROCESSING: "gold",
      SHIPPED: "purple",
      DELIVERED: "green",
      COMPLETED: "cyan",
      CANCELLED: "red",
    };
    return (
      <Tag color={colorMap[status] || "default"}>{status}</Tag>
    );
  };

  //  5. Cấu hình bảng
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      width: 150,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => navigate(`/dealer/orders/${record.id}`)}
          className="p-0 h-auto font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Ngày đặt hàng",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Chi tiết sản phẩm",
      key: "vehicleDetails",
      render: (_, record) => {
        const details = record.orderDetails || [];
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {details.map((detail, index) => (
              <div key={index} style={{ fontSize: "14px" }}>
                <div style={{ fontWeight: 600 }}>
                  {detail.vehicleModelName || "N/A"}
                </div>
                <div style={{ color: "#666", fontSize: "12px" }}>
                  {detail.vehicleColorName || "N/A"} • SL: {detail.quantity}
                </div>
                <div style={{ color: "#1890ff", fontSize: "12px" }}>
                  {formatCurrency(detail.unitPrice)} × {detail.quantity} ={" "}
                  {formatCurrency(detail.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        );
      },
      width: 280,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      width: 150,
      sorter: (a, b) => (a.totalAmount || 0) - (b.totalAmount || 0),
    },
    {
      title: "Tiến độ thanh toán",
      key: "paymentProgress",
      render: (_, record) => (
        <div>
          <Progress
            percent={record.paymentProgress || 0}
            size="small"
            strokeColor={
              record.paymentProgress === 100 ? "#52c41a" : "#1890ff"
            }
          />
          <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
            Đã trả: {formatCurrency(record.paidAmount || 0)}
          </div>
          <div style={{ fontSize: "11px", color: "#666" }}>
            Còn lại: {formatCurrency(record.remainingAmount || 0)}
          </div>
        </div>
      ),
      width: 180,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
      width: 120,
      filters: [
        { text: "PENDING", value: "PENDING" },
        { text: "CONFIRMED", value: "CONFIRMED" },
        { text: "PROCESSING", value: "PROCESSING" },
        { text: "SHIPPED", value: "SHIPPED" },
        { text: "DELIVERED", value: "DELIVERED" },
        { text: "COMPLETED", value: "COMPLETED" },
        { text: "CANCELLED", value: "CANCELLED" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Hình thức thanh toán",
      key: "paymentType",
      render: (_, record) => (
        <Tag color={record.isInstallment ? "blue" : "green"}>
          {record.isInstallment ? "Trả góp" : "Thanh toán đủ"}
        </Tag>
      ),
      width: 140,
    },
    {
      title: "Người tạo",
      key: "createdBy",
      render: (_, record) => (
        <div style={{ fontSize: "14px" }}>
          <div style={{ fontWeight: 500 }}>
            {record.createdBy?.fullName || "N/A"}
          </div>
          <div style={{ color: "#666", fontSize: "12px" }}>
            @{record.createdBy?.username || "N/A"}
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/dealer/orders/${record.id}`)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold m-0">
              Quản lý đơn hàng
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Xem danh sách tất cả đơn hàng thuộc dealer hiện tại
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/dealer/cart")}
            className="w-full sm:w-auto"
          >
            Tạo đơn hàng mới
          </Button>
        </div>

        <Spin spinning={loading}>
          {orders.length === 0 && !loading ? (
            <Card>
              <Empty
                description="Chưa có đơn hàng nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate("/dealer/cart")}
                >
                  Tạo đơn hàng đầu tiên
                </Button>
              </Empty>
            </Card>
          ) : (
            <Card>
              <Table
                rowKey="id"
                columns={columns}
                dataSource={orders}
                loading={loading}
                bordered
                scroll={{ x: 'max-content' }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} của ${total} đơn hàng`,
                  responsive: true,
                }}
                locale={{
                  emptyText: loading ? "Đang tải..." : "Chưa có đơn hàng nào",
                }}
              />
            </Card>
          )}
        </Spin>
      </div>
    </DealerLayout>
  );
}
