import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Card,
  Divider,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Progress,
  Typography,
  Popconfirm,
  InputNumber,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ShopOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState({}); // Loading state for approve actions
  const [confirmPaymentLoading, setConfirmPaymentLoading] = useState({}); // Loading state for payment confirmations
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    orderCode: "",
    dealerName: "",
    dateRange: null,
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Helper function to format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/orders");
      if (response.data && response.data.success) {
        const ordersData = response.data.data || [];
        setOrders(ordersData);
        calculateStatistics(ordersData);
      } else {
        message.error("Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Error loading orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (ordersData) => {
    const stats = {
      totalOrders: ordersData.length,
      totalAmount: ordersData.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      ),
      pendingOrders: ordersData.filter((order) =>
        ["PENDING", "CONFIRMED"].includes(order.status)
      ).length,
      approvedOrders: ordersData.filter((order) => order.status === "APPROVED")
        .length,
      completedOrders: ordersData.filter((order) =>
        ["COMPLETED", "DELIVERED"].includes(order.status)
      ).length,
      rejectedOrders: ordersData.filter((order) =>
        ["REJECTED"].includes(order.status)
      ).length,
      cancelledOrders: ordersData.filter(
        (order) => order.status === "CANCELLED"
      ).length,
    };
    setStatistics(stats);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "orange",
      CONFIRMED: "blue",
      APPROVED: "green",
      PROCESSING: "cyan",
      SHIPPED: "purple",
      DELIVERED: "green",
      COMPLETED: "green",
      CANCELLED: "magenta",
      REJECTED: "red",
      REFUNDED: "volcano",
    };
    return statusColors[status] || "default";
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Handle order detail view
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Handle order approval
  const handleApproveOrder = async (orderId) => {
    console.log("Approving order with ID:", orderId);
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      // Try with status in body as per API requirement
      const response = await api.patch(`/admin/orders/${orderId}/approve`, {
        status: "APPROVED",
      });
      console.log("Approve response:", response.data);

      if (response.data && response.data.success) {
        message.success({
          content: (
            <div>
              <div>
                <strong>Đơn hàng đã được phê duyệt thành công!</strong>
              </div>
              <div>Order Code: {response.data.data.orderCode}</div>
              <div>Status: {response.data.data.status}</div>
              <div>VIN/Engine đã được tạo và hàng đã nhập kho dealer</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list
        fetchOrders();
      } else {
        message.error(response.data?.message || "Phê duyệt đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error approving order:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi phê duyệt đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.patch(`/admin/orders/${orderId}/reject`);

      if (response.data && response.data.success) {
        message.success("Đơn hàng đã được từ chối!");
        // Refresh orders list
        fetchOrders();
      } else {
        message.error(response.data?.message || "Từ chối đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi từ chối đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.patch(`/admin/orders/${orderId}/cancel`);

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        message.success({
          content: (
            <div>
              <div>
                <strong>Đơn hàng đã được hủy thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {orderData.status}</div>
              <div>Lý do: Đơn hàng chưa hoàn tất hoặc chưa giao xe</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list
        fetchOrders();
      } else {
        message.error(response.data?.message || "Hủy đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Check if order can be approved/rejected
  const canApproveOrder = (status) => {
    return status === "PENDING";
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    // Can cancel orders that haven't been completed or delivered yet
    return [
      "PENDING",
      "CONFIRMED",
      "APPROVED",
      "PROCESSING",
      "SHIPPED",
    ].includes(status);
  };

  // Handle installment payment confirmation
  const handleConfirmInstallmentPayment = async (
    orderId,
    installmentNumber
  ) => {
    const loadingKey = `${orderId}-${installmentNumber}`;
    setConfirmPaymentLoading((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await api.post(
        `/admin/orders/${orderId}/installments/${installmentNumber}/confirm`
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        message.success({
          content: (
            <div>
              <div>
                <strong>Xác nhận thanh toán thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Kỳ thanh toán: {installmentNumber}</div>
              <div>Tiến độ thanh toán: {orderData.paymentProgress}%</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list
        fetchOrders();

        // Update selected order if modal is open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(orderData);
        }
      } else {
        message.error(
          response.data?.message || "Xác nhận thanh toán thất bại!"
        );
      }
    } catch (error) {
      console.error("Error confirming installment payment:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi xác nhận thanh toán!";
      message.error(errorMessage);
    } finally {
      setConfirmPaymentLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Check if order has installment payments
  const hasInstallmentPayments = (order) => {
    return (
      order &&
      order.isInstallment &&
      order.installmentPlans &&
      order.installmentPlans.length > 0
    );
  };

  // Check if installment can be confirmed (order must be CONFIRMED and installment not paid)
  const canConfirmInstallment = (order, installment) => {
    return (
      order.status === "CONFIRMED" &&
      installment.status !== "PAID" &&
      installment.status !== "CONFIRMED"
    );
  };

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order) => {
    let matches = true;

    if (filters.status && order.status !== filters.status) {
      matches = false;
    }

    if (
      filters.orderCode &&
      !order.orderCode.toLowerCase().includes(filters.orderCode.toLowerCase())
    ) {
      matches = false;
    }

    if (
      filters.dealerName &&
      !order.dealer?.name
        .toLowerCase()
        .includes(filters.dealerName.toLowerCase())
    ) {
      matches = false;
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const orderDate = new Date(order.orderDate);
      const [startDate, endDate] = filters.dateRange;
      if (orderDate < startDate || orderDate > endDate) {
        matches = false;
      }
    }

    return matches;
  });

  // Table columns
  const columns = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      width: 150,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetail(record)}
          className="p-0 h-auto"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Dealer",
      dataIndex: "dealer",
      key: "dealer",
      width: 200,
      render: (dealer) => (
        <div>
          <div className="font-medium">{dealer?.name}</div>
          <Text type="secondary" className="text-xs">
            Code: {dealer?.code} | Level: {dealer?.levelName}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Payment Progress",
      dataIndex: "paymentProgress",
      key: "paymentProgress",
      width: 150,
      render: (progress, record) => (
        <div>
          <Progress
            percent={progress}
            size="small"
            strokeColor={progress === 100 ? "#52c41a" : "#1890ff"}
          />
          <Text className="text-xs">
            Paid: {formatCurrency(record.paidAmount)}
          </Text>
        </div>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 150,
      render: (createdBy) => (
        <div>
          <div className="font-medium">{createdBy?.fullName}</div>
          <Text type="secondary" className="text-xs">
            @{createdBy?.username}
          </Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Space>
            <Tooltip title="View Details">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
                size="small"
              >
                View
              </Button>
            </Tooltip>
          </Space>

          {canApproveOrder(record.status) && (
            <Space wrap>
              <Popconfirm
                title="Phê duyệt đơn hàng"
                description={
                  <div>
                    <div>Bạn có chắc chắn muốn phê duyệt đơn hàng này?</div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Tự động tạo VIN/Engine
                      <br />• Nhập hàng vào kho dealer
                    </div>
                  </div>
                }
                onConfirm={() => handleApproveOrder(record.id)}
                okText="Phê duyệt"
                cancelText="Hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  type: "primary",
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Phê duyệt
                </Button>
              </Popconfirm>

              <Popconfirm
                title="Từ chối đơn hàng"
                description="Bạn có chắc chắn muốn từ chối đơn hàng này?"
                onConfirm={() => handleRejectOrder(record.id)}
                okText="Từ chối"
                cancelText="Hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  danger: true,
                }}
              >
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Từ chối
                </Button>
              </Popconfirm>
            </Space>
          )}

          {canCancelOrder(record.status) && (
            <Space>
              <Popconfirm
                title="Hủy đơn hàng"
                description={
                  <div>
                    <div>Bạn có chắc chắn muốn hủy đơn hàng này?</div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Đơn hàng chưa hoàn tất hoặc chưa giao xe
                      <br />• Hành động này không thể hoàn tác
                    </div>
                  </div>
                }
                onConfirm={() => handleCancelOrder(record.id)}
                okText="Hủy đơn hàng"
                cancelText="Không hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  danger: true,
                }}
              >
                <Button
                  type="default"
                  icon={<StopOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Hủy đơn hàng
                </Button>
              </Popconfirm>
            </Space>
          )}

          {!canApproveOrder(record.status) &&
            !canCancelOrder(record.status) && (
              <Tag color="default" className="text-xs">
                {record.status === "APPROVED"
                  ? "Đã phê duyệt"
                  : record.status === "REJECTED"
                  ? "Đã từ chối"
                  : record.status === "CANCELLED"
                  ? "Đã hủy"
                  : record.status === "DELIVERED"
                  ? "Đã giao xe"
                  : record.status === "COMPLETED"
                  ? "Đã hoàn tất"
                  : "Không thể thao tác"}
              </Tag>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          <FileTextOutlined className="mr-2" />
          Order Management
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6">
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Orders"
              value={statistics.totalOrders}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Total Amount"
              value={statistics.totalAmount}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Pending"
              value={statistics.pendingOrders}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Approved"
              value={statistics.approvedOrders}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card>
            <Statistic
              title="Completed"
              value={statistics.completedOrders}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic
              title="Rejected"
              value={statistics.rejectedOrders}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic
              title="Cancelled"
              value={statistics.cancelledOrders}
              valueStyle={{ color: "#722ed1" }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col span={3}>
          <Card className="bg-gradient-to-r from-blue-50 to-green-50">
            <Statistic
              title="Success Rate"
              value={
                statistics.totalOrders > 0
                  ? Math.round(
                      ((statistics.approvedOrders +
                        statistics.completedOrders) /
                        statistics.totalOrders) *
                        100
                    )
                  : 0
              }
              suffix="%"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={6}>
            <Search
              placeholder="Search by order code"
              value={filters.orderCode}
              onChange={(e) =>
                setFilters({ ...filters, orderCode: e.target.value })
              }
              allowClear
            />
          </Col>
          <Col span={6}>
            <Search
              placeholder="Search by dealer name"
              value={filters.dealerName}
              onChange={(e) =>
                setFilters({ ...filters, dealerName: e.target.value })
              }
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Filter by status"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              className="w-full"
            >
              <Option value="PENDING">Pending</Option>
              <Option value="CONFIRMED">Confirmed</Option>
              <Option value="APPROVED">Approved</Option>
              <Option value="PROCESSING">Processing</Option>
              <Option value="SHIPPED">Shipped</Option>
              <Option value="DELIVERED">Delivered</Option>
              <Option value="COMPLETED">Completed</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="CANCELLED">Cancelled</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              className="w-full"
              format="DD/MM/YYYY"
            />
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredOrders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} orders`,
          }}
        />
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined className="mr-2" />
            Order Details
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={
          selectedOrder ? (
            <Space>
              <Button onClick={() => setDetailModalVisible(false)}>
                Close
              </Button>

              {canApproveOrder(selectedOrder.status) && (
                <>
                  <Popconfirm
                    title="Phê duyệt đơn hàng"
                    description={
                      <div>
                        <div>Bạn có chắc chắn muốn phê duyệt đơn hàng này?</div>
                        <div className="mt-2 text-sm text-gray-600">
                          • Tự động tạo VIN/Engine
                          <br />• Nhập hàng vào kho dealer
                        </div>
                      </div>
                    }
                    onConfirm={() => {
                      handleApproveOrder(selectedOrder.id);
                      setDetailModalVisible(false);
                    }}
                    okText="Phê duyệt"
                    cancelText="Hủy"
                    okButtonProps={{
                      loading: approveLoading[selectedOrder.id],
                      type: "primary",
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={approveLoading[selectedOrder.id]}
                      disabled={Object.values(approveLoading).some(
                        (loading) => loading
                      )}
                    >
                      Phê duyệt đơn hàng
                    </Button>
                  </Popconfirm>
                  <Popconfirm
                    title="Từ chối đơn hàng"
                    description="Bạn có chắc chắn muốn từ chối đơn hàng này?"
                    onConfirm={() => {
                      handleRejectOrder(selectedOrder.id);
                      setDetailModalVisible(false);
                    }}
                    okText="Từ chối"
                    cancelText="Hủy"
                    okButtonProps={{
                      loading: approveLoading[selectedOrder.id],
                      danger: true,
                    }}
                  >
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      loading={approveLoading[selectedOrder.id]}
                      disabled={Object.values(approveLoading).some(
                        (loading) => loading
                      )}
                    >
                      Từ chối đơn hàng
                    </Button>
                  </Popconfirm>
                </>
              )}

              {canCancelOrder(selectedOrder.status) && (
                <Popconfirm
                  title="Hủy đơn hàng"
                  description={
                    <div>
                      <div>Bạn có chắc chắn muốn hủy đơn hàng này?</div>
                      <div className="mt-2 text-sm text-gray-600">
                        • Đơn hàng chưa hoàn tất hoặc chưa giao xe
                        <br />• Hành động này không thể hoàn tác
                      </div>
                    </div>
                  }
                  onConfirm={() => {
                    handleCancelOrder(selectedOrder.id);
                    setDetailModalVisible(false);
                  }}
                  okText="Hủy đơn hàng"
                  cancelText="Không hủy"
                  okButtonProps={{
                    loading: approveLoading[selectedOrder.id],
                    danger: true,
                  }}
                >
                  <Button
                    type="default"
                    icon={<StopOutlined />}
                    loading={approveLoading[selectedOrder.id]}
                    disabled={Object.values(approveLoading).some(
                      (loading) => loading
                    )}
                  >
                    Hủy đơn hàng
                  </Button>
                </Popconfirm>
              )}
            </Space>
          ) : (
            <Button onClick={() => setDetailModalVisible(false)}>Close</Button>
          )
        }
      >
        {selectedOrder && (
          <div>
            {/* Basic Order Info */}
            <Card className="mb-4">
              <Descriptions title="Order Information" bordered>
                <Descriptions.Item label="Order Code" span={2}>
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {formatDateTime(selectedOrder.orderDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  <Text strong className="text-lg">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Progress">
                  <Progress percent={selectedOrder.paymentProgress} />
                </Descriptions.Item>
                <Descriptions.Item label="Deposit Amount">
                  {formatCurrency(selectedOrder.depositAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Paid Amount">
                  {formatCurrency(selectedOrder.paidAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Remaining Amount">
                  <Text
                    type={
                      selectedOrder.remainingAmount > 0 ? "warning" : "success"
                    }
                  >
                    {formatCurrency(selectedOrder.remainingAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Type">
                  <Tag color={selectedOrder.isInstallment ? "blue" : "green"}>
                    {selectedOrder.isInstallment
                      ? "Installment"
                      : "Full Payment"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Full Payment Date">
                  {formatDate(selectedOrder.fullPaymentDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Notes" span={3}>
                  {selectedOrder.notes || "No notes"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Dealer Information */}
            <Card
              title={
                <span>
                  <ShopOutlined className="mr-2" />
                  Dealer Information
                </span>
              }
              className="mb-4"
            >
              <Descriptions bordered>
                <Descriptions.Item label="Dealer Name" span={2}>
                  {selectedOrder.dealer?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Dealer Code">
                  {selectedOrder.dealer?.code}
                </Descriptions.Item>
                <Descriptions.Item label="Level">
                  <Tag color="blue">{selectedOrder.dealer?.levelName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Current Debt">
                  <Text
                    type={
                      selectedOrder.dealer?.currentDebt > 0
                        ? "danger"
                        : "success"
                    }
                  >
                    {formatCurrency(selectedOrder.dealer?.currentDebt)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Available Credit">
                  {formatCurrency(selectedOrder.dealer?.availableCredit)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Created By */}
            <Card
              title={
                <span>
                  <UserOutlined className="mr-2" />
                  Created By
                </span>
              }
              className="mb-4"
            >
              <Descriptions bordered>
                <Descriptions.Item label="Full Name">
                  {selectedOrder.createdBy?.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Username">
                  {selectedOrder.createdBy?.username}
                </Descriptions.Item>
                <Descriptions.Item label="Created At">
                  {formatDateTime(selectedOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Updated At">
                  {formatDateTime(selectedOrder.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Details */}
            <Card
              title={
                <span>
                  <CarOutlined className="mr-2" />
                  Order Items
                </span>
              }
              className="mb-4"
            >
              <Table
                dataSource={selectedOrder.orderDetails}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: "Vehicle Model",
                    dataIndex: "vehicleModelName",
                    key: "vehicleModelName",
                  },
                  {
                    title: "Color",
                    dataIndex: "vehicleColorName",
                    key: "vehicleColorName",
                    render: (color) => <Tag>{color}</Tag>,
                  },
                  {
                    title: "Quantity",
                    dataIndex: "quantity",
                    key: "quantity",
                    align: "center",
                  },
                  {
                    title: "Unit Price",
                    dataIndex: "unitPrice",
                    key: "unitPrice",
                    render: (price) => formatCurrency(price),
                  },
                  {
                    title: "Total Price",
                    dataIndex: "totalPrice",
                    key: "totalPrice",
                    render: (price) => (
                      <Text strong>{formatCurrency(price)}</Text>
                    ),
                  },
                ]}
              />
            </Card>

            {/* Installment Plans */}
            {selectedOrder.isInstallment &&
              selectedOrder.installmentPlans?.length > 0 && (
                <Card
                  title={
                    <span>
                      <CalendarOutlined className="mr-2" />
                      Installment Plans
                    </span>
                  }
                >
                  <Table
                    dataSource={selectedOrder.installmentPlans}
                    rowKey="installmentNumber"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Installment #",
                        dataIndex: "installmentNumber",
                        key: "installmentNumber",
                        align: "center",
                      },
                      {
                        title: "Amount",
                        dataIndex: "installmentAmount",
                        key: "installmentAmount",
                        render: (amount) => formatCurrency(amount),
                      },
                      {
                        title: "Due Date",
                        dataIndex: "dueDate",
                        key: "dueDate",
                        render: (date) => formatDate(date),
                      },
                      {
                        title: "Status",
                        dataIndex: "status",
                        key: "status",
                        render: (status, record) => (
                          <Space>
                            <Tag color={getStatusColor(status)}>{status}</Tag>
                            {record.isOverdue && <Tag color="red">Overdue</Tag>}
                          </Space>
                        ),
                      },
                      {
                        title: "Payment Confirmation",
                        key: "paymentConfirmation",
                        align: "center",
                        render: (_, record) => {
                          const canConfirmPayment =
                            selectedOrder.status === "CONFIRMED" &&
                            (record.status === "PENDING" ||
                              record.status === "OVERDUE");

                          if (record.status === "PAID") {
                            return <Tag color="green">Đã thanh toán</Tag>;
                          }

                          if (canConfirmPayment) {
                            return (
                              <Button
                                type="primary"
                                size="small"
                                icon={<DollarCircleOutlined />}
                                loading={
                                  confirmPaymentLoading[
                                    `${selectedOrder.id}-${record.installmentNumber}`
                                  ]
                                }
                                onClick={() =>
                                  handleConfirmInstallmentPayment(
                                    selectedOrder.id,
                                    record.installmentNumber
                                  )
                                }
                              >
                                Xác nhận thanh toán
                              </Button>
                            );
                          }

                          return <Text type="secondary">Không khả dụng</Text>;
                        },
                      },
                    ]}
                  />
                </Card>
              )}
          </div>
        )}
      </Modal>
    </div>
  );
}
