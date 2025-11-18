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
  Popconfirm,
} from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Text } = Typography;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  //  1. Fetch chi tiết đơn hàng
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

  // 2. Xác nhận nhận hàng
  const handleConfirmReceived = async () => {
    try {
      const res = await apiClient.patch(`/api/dealer/orders/${id}/confirm-received`);
      
      if (res.data && res.data.success) {
        const orderData = res.data.data;
        message.success(
          `Xác nhận nhận hàng thành công! Đơn hàng ${orderData.orderCode} đã được cập nhật trạng thái.`
        );
        
        // Refresh order detail
        setOrder(orderData);
      } else {
        message.error(res.data.message || "Không thể xác nhận nhận hàng!");
      }
    } catch (err) {
      console.error("Error confirming received order:", err);
      const errorMsg =
        err.response?.data?.message || "Có lỗi xảy ra khi xác nhận nhận hàng!";
      message.error(errorMsg);
    }
  };

  //  3. Format currency
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

  //  4. Render trạng thái
  const renderStatus = (status) => {
    const colorMap = {
      PENDING: "orange",
      CONFIRMED: "blue",
      PROCESSING: "gold",
      SHIPPING: "orange",
      SHIPPED: "purple",
      DELIVERED: "green",
      COMPLETED: "cyan",
      CANCELLED: "red",
    };
    
    const labelMap = {
      PENDING: "Chờ duyệt",
      CONFIRMED: "Đã xác nhận",
      PROCESSING: "Đang xử lý",
      SHIPPING: "Đang vận chuyển",
      SHIPPED: "Đã gửi",
      DELIVERED: "Đã giao",
      COMPLETED: "Hoàn tất",
      CANCELLED: "Đã hủy",
    };
    
    return <Tag color={colorMap[status] || "default"}>
      {labelMap[status] || status}
    </Tag>;
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
        <Card 
          title={`Chi tiết đơn hàng - ${order.orderCode}`} 
          style={{ marginBottom: "16px" }}
          extra={
            order.status === "SHIPPING" && (
              <Popconfirm
                title="Xác nhận nhận hàng"
                description={
                  <div>
                    <div>Bạn xác nhận đã nhận được xe từ hãng?</div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Xe đạt chuẩn chất lượng
                      <br />• Xe sẽ được thêm vào kho dealer
                      <br />• Trạng thái đơn hàng sẽ được cập nhật
                    </div>
                  </div>
                }
                onConfirm={handleConfirmReceived}
                okText="Xác nhận"
                cancelText="Hủy"
                okButtonProps={{
                  type: "primary",
                  style: { backgroundColor: "#52c41a", borderColor: "#52c41a" }
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="default"
                  style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                >
                  Xác nhận nhận hàng
                </Button>
              </Popconfirm>
            )
          }
        >
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

        {/* Sản phẩm đặt hàng */}
        <Card title="Sản phẩm đặt hàng" style={{ marginBottom: "16px" }}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Model xe">
              <Text strong>{order.requestedModelColor?.modelName || "N/A"}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc">
              <Tag color="blue">{order.requestedModelColor?.colorName || "N/A"}</Tag>
            </Descriptions.Item>
          </Descriptions>
          
          {/* Thông tin xe đã gán */}
          {order.assignedVehicle && (
            <div style={{ marginTop: "16px" }}>
              <h4>Xe đã được gán</h4>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="VIN">
                  <Text strong>{order.assignedVehicle.vin}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số máy">
                  {order.assignedVehicle.engineNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                  {order.assignedVehicle.modelName}
                </Descriptions.Item>
                <Descriptions.Item label="Màu">
                  <Tag>{order.assignedVehicle.colorName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái xe" span={2}>
                  {renderStatus(order.assignedVehicle.status)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
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
