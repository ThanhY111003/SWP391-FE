// src/pages/dealer/orderDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Tag,
  Button,
  Descriptions,
  message,
  Progress,
  Spin,
  Space,
  Typography,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Text } = Typography;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🧩 1. Fetch chi tiết đơn hàng
  useEffect(() => {
    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/api/dealer/orders/${id}`);
        if (res.data.success) {
          setOrder(res.data.data);
        } else {
          message.error(
            res.data.message || "Không thể tải chi tiết đơn hàng!"
          );
        }
      } catch (err) {
        console.error("Error fetching order detail:", err);
        const errorMsg =
          err.response?.data?.message || "Không thể tải chi tiết đơn hàng!";
        message.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  // 🧩 2. Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // 🧩 3. Format date
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

  // 🧩 4. Render trạng thái
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
    return <Tag color={colorMap[status] || "default"}>{status}</Tag>;
  };

  if (loading) {
    return (
      <DealerLayout>
        <div style={{ padding: "24px", textAlign: "center" }}>
          <Spin size="large" />
          <div style={{ marginTop: "16px" }}>Đang tải chi tiết đơn hàng...</div>
        </div>
      </DealerLayout>
    );
  }

  if (!order) {
    return (
      <DealerLayout>
        <div style={{ padding: "24px" }}>
          <Card>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Không tìm thấy đơn hàng</p>
              <Button type="primary" onClick={() => navigate("/dealer/orders")}>
                Quay lại danh sách đơn hàng
              </Button>
            </div>
          </Card>
        </div>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <div style={{ padding: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer/orders")}
            style={{ marginBottom: "16px" }}
          >
            Quay lại
          </Button>
        </div>

        {/* Thông tin đơn hàng */}
        <Card title={`Chi tiết đơn hàng - ${order.orderCode}`} style={{ marginBottom: "16px" }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã đơn hàng">
              <Text strong>{order.orderCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {renderStatus(order.status)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo đơn">
              {formatDate(order.orderDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <Text strong style={{ fontSize: "18px" }}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tiền đặt cọc">
              {formatCurrency(order.depositAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Đã thanh toán">
              {formatCurrency(order.paidAmount)}
            </Descriptions.Item>
            <Descriptions.Item label="Còn lại">
              <Text
                type={order.remainingAmount > 0 ? "warning" : "success"}
              >
                {formatCurrency(order.remainingAmount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tiến độ thanh toán">
              <Progress percent={order.paymentProgress || 0} />
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức thanh toán">
              <Tag color={order.isInstallment ? "blue" : "green"}>
                {order.isInstallment ? "Trả góp" : "Thanh toán đủ"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán đủ">
              {formatDate(order.fullPaymentDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo đơn">
              <div>
                <div style={{ fontWeight: 500 }}>
                  {order.createdBy?.fullName || "N/A"}
                </div>
                <div style={{ color: "#666", fontSize: "12px" }}>
                  @{order.createdBy?.username || "N/A"}
                </div>
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {order.notes || "Không có ghi chú"}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Thông tin đại lý */}
        {order.dealer && (
          <Card title="Thông tin đại lý" style={{ marginBottom: "16px" }}>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên đại lý">
                {order.dealer.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã đại lý">
                {order.dealer.code}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp độ">
                <Tag color="blue">{order.dealer.levelName}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Công nợ hiện tại">
                <Text type={order.dealer.currentDebt > 0 ? "danger" : "success"}>
                  {formatCurrency(order.dealer.currentDebt)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hạn mức tín dụng">
                {formatCurrency(order.dealer.availableCredit)}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {/* Chi tiết sản phẩm */}
        <Card title="Chi tiết sản phẩm" style={{ marginBottom: "16px" }}>
          <Table
            dataSource={order.orderDetails || []}
            rowKey="id"
            pagination={false}
            size="small"
            columns={[
              {
                title: "Model xe",
                dataIndex: "vehicleModelName",
                key: "vehicleModelName",
              },
              {
                title: "Màu sắc",
                dataIndex: "vehicleColorName",
                key: "vehicleColorName",
                render: (color) => <Tag>{color}</Tag>,
              },
              {
                title: "Số lượng",
                dataIndex: "quantity",
                key: "quantity",
                align: "center",
              },
              {
                title: "Đơn giá",
                dataIndex: "unitPrice",
                key: "unitPrice",
                render: (price) => formatCurrency(price),
              },
              {
                title: "Thành tiền",
                dataIndex: "totalPrice",
                key: "totalPrice",
                render: (price) => <Text strong>{formatCurrency(price)}</Text>,
              },
            ]}
          />
        </Card>

        {/* Kế hoạch trả góp */}
        {order.isInstallment &&
          order.installmentPlans &&
          order.installmentPlans.length > 0 && (
            <Card title="Kế hoạch trả góp">
              <Table
                dataSource={order.installmentPlans}
                rowKey="installmentNumber"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Kỳ",
                    dataIndex: "installmentNumber",
                    key: "installmentNumber",
                    align: "center",
                  },
                  {
                    title: "Số tiền",
                    dataIndex: "installmentAmount",
                    key: "installmentAmount",
                    render: (amount) => formatCurrency(amount),
                  },
                  {
                    title: "Ngày đáo hạn",
                    dataIndex: "dueDate",
                    key: "dueDate",
                    render: (date) => formatDate(date),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    key: "status",
                    render: (status, record) => (
                      <Space>
                        {renderStatus(status)}
                        {record.isOverdue && <Tag color="red">Quá hạn</Tag>}
                      </Space>
                    ),
                  },
                ]}
              />
            </Card>
          )}
      </div>
    </DealerLayout>
  );
};

export default OrderDetail;
