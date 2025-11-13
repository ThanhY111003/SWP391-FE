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
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import {
  EyeOutlined,
  PlusOutlined,
  WarningOutlined,
  FileTextOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Text } = Typography;
const { TextArea } = Input;

export default function ManageOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defectsModalOpen, setDefectsModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [warrantyModalOpen, setWarrantyModalOpen] = useState(false);
  const [defects, setDefects] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [warrantyVehicles, setWarrantyVehicles] = useState([]);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingWarrantyVehicles, setLoadingWarrantyVehicles] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [reportForm] = Form.useForm();
  const [warrantyForm] = Form.useForm();

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

  //  3b. Format date-time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
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

  //  5. Xem danh sách xe lỗi
  const handleViewDefects = async (orderId) => {
    setSelectedOrderId(orderId);
    setLoadingDefects(true);
    setDefectsModalOpen(true);
    try {
      const res = await apiClient.get(`/api/defects/dealer/order/${orderId}`);
      if (res.data.success) {
        setDefects(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe lỗi!");
        setDefects([]);
      }
    } catch (err) {
      console.error("Error fetching defects:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe lỗi!";
      message.error(errorMsg);
      setDefects([]);
    } finally {
      setLoadingDefects(false);
    }
  };

  //  6. Mở modal báo cáo xe lỗi
  const handleOpenReportModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setLoadingVehicles(true);
    setReportModalOpen(true);
    reportForm.resetFields();
    try {
      const res = await apiClient.get(`/api/dealer/orders/${orderId}/vehicles`);
      if (res.data.success) {
        setVehicles(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
        setVehicles([]);
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe!";
      message.error(errorMsg);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  //  7. Báo cáo xe lỗi
  const handleReportDefect = async () => {
    try {
      const values = await reportForm.validateFields();
      const params = new URLSearchParams();
      params.append("reason", values.reason);

      const res = await apiClient.post(
        `/api/defects/dealer/orders/${selectedOrderId}/vehicles/${values.vehicleId}/report?${params.toString()}`
      );
      if (res.data.success) {
        message.success(res.data.message || "Báo cáo xe lỗi thành công!");
        setReportModalOpen(false);
        reportForm.resetFields();
        // Refresh danh sách đơn hàng
        fetchOrders();
      } else {
        message.error(res.data.message || "Không thể báo cáo xe lỗi!");
      }
    } catch (err) {
      console.error("Error reporting defect:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể báo cáo xe lỗi!";
      message.error(errorMsg);
    }
  };

  //  8. Mở modal tạo yêu cầu bảo hành
  const handleOpenWarrantyModal = async (orderId) => {
    setSelectedOrderId(orderId);
    setLoadingWarrantyVehicles(true);
    setWarrantyModalOpen(true);
    warrantyForm.resetFields();
    try {
      const res = await apiClient.get(`/api/dealer/orders/${orderId}/vehicles`);
      console.log("Vehicles response:", res.data); // Debug log
      if (res.data.success) {
        const vehiclesData = res.data.data || [];
        console.log("Vehicles data:", vehiclesData); // Debug log
        // Lấy tất cả các xe trong đơn hàng (không filter)
        // Vì yêu cầu bảo hành có thể áp dụng cho các xe đã được giao
        setWarrantyVehicles(vehiclesData);
        
        if (vehiclesData.length === 0) {
          message.warning("Không có xe nào trong đơn hàng này để tạo yêu cầu bảo hành!");
        }
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
        setWarrantyVehicles([]);
      }
    } catch (err) {
      console.error("Error fetching vehicles for warranty:", err);
      console.error("Error response:", err.response); // Debug log
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe!";
      message.error(errorMsg);
      setWarrantyVehicles([]);
    } finally {
      setLoadingWarrantyVehicles(false);
    }
  };

  //  9. Tạo yêu cầu bảo hành
  const handleCreateWarranty = async () => {
    try {
      const values = await warrantyForm.validateFields();
      const params = new URLSearchParams();
      params.append("reason", values.reason);

      const res = await apiClient.post(
        `/api/warranty/dealer/${values.vehicleId}/request?${params.toString()}`
      );
      if (res.data.success) {
        message.success(res.data.message || "Tạo yêu cầu bảo hành thành công!");
        setWarrantyModalOpen(false);
        warrantyForm.resetFields();
        // Refresh danh sách đơn hàng
        fetchOrders();
      } else {
        message.error(res.data.message || "Không thể tạo yêu cầu bảo hành!");
      }
    } catch (err) {
      console.error("Error creating warranty request:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tạo yêu cầu bảo hành!";
      message.error(errorMsg);
    }
  };

  //  10. Cấu hình bảng
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
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" direction="vertical" style={{ width: "100%" }}>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/dealer/orders/${record.id}`)}
            size="small"
            block
          >
            Chi tiết
          </Button>
          <Button
            icon={<FileTextOutlined />}
            onClick={() => handleViewDefects(record.id)}
            size="small"
            block
          >
            Xem xe lỗi
          </Button>
          <Button
            icon={<WarningOutlined />}
            onClick={() => handleOpenReportModal(record.id)}
            size="small"
            danger
            block
          >
            Báo cáo xe lỗi
          </Button>
          <Button
            icon={<SafetyOutlined />}
            onClick={() => handleOpenWarrantyModal(record.id)}
            size="small"
            block
            style={{ borderColor: "#52c41a", color: "#52c41a" }}
          >
            Tạo yêu cầu bảo hành
          </Button>
        </Space>
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

        {/* Modal danh sách xe lỗi */}
        <Modal
          open={defectsModalOpen}
          onCancel={() => {
            setDefectsModalOpen(false);
            setDefects([]);
            setSelectedOrderId(null);
          }}
          title="Danh sách xe lỗi"
          footer={[
            <Button key="close" onClick={() => setDefectsModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={900}
        >
          <Spin spinning={loadingDefects}>
            {defects.length === 0 ? (
              <Empty
                description="Không có xe lỗi nào trong đơn hàng này"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                rowKey="id"
                columns={[
                  {
                    title: "ID",
                    dataIndex: "id",
                    key: "id",
                    width: 80,
                  },
                  {
                    title: "VIN",
                    dataIndex: "vin",
                    key: "vin",
                  },
                  {
                    title: "Số máy",
                    dataIndex: "engineNumber",
                    key: "engineNumber",
                  },
                  {
                    title: "Model",
                    dataIndex: "modelName",
                    key: "modelName",
                  },
                  {
                    title: "Màu",
                    dataIndex: "colorName",
                    key: "colorName",
                  },
                  {
                    title: "Lý do",
                    dataIndex: "reason",
                    key: "reason",
                    ellipsis: true,
                  },
                  {
                    title: "Đã phê duyệt",
                    dataIndex: "isApproved",
                    key: "isApproved",
                    render: (isApproved) => (
                      <Tag color={isApproved ? "green" : "orange"}>
                        {isApproved ? "Đã phê duyệt" : "Chờ phê duyệt"}
                      </Tag>
                    ),
                  },
                  {
                    title: "Đã sửa xong",
                    dataIndex: "isRepairCompleted",
                    key: "isRepairCompleted",
                    render: (isRepairCompleted) => (
                      <Tag color={isRepairCompleted ? "green" : "default"}>
                        {isRepairCompleted ? "Đã sửa xong" : "Chưa sửa"}
                      </Tag>
                    ),
                  },
                  {
                    title: "Ngày báo cáo",
                    dataIndex: "reportedAt",
                    key: "reportedAt",
                    render: (date) => (date ? formatDateTime(date) : "-"),
                  },
                ]}
                dataSource={defects}
                pagination={false}
                size="small"
              />
            )}
          </Spin>
        </Modal>

        {/* Modal báo cáo xe lỗi */}
        <Modal
          open={reportModalOpen}
          onCancel={() => {
            setReportModalOpen(false);
            reportForm.resetFields();
            setVehicles([]);
            setSelectedOrderId(null);
          }}
          title="Báo cáo xe lỗi"
          onOk={handleReportDefect}
          okText="Báo cáo"
          cancelText="Hủy"
          width={600}
          destroyOnClose
        >
          <Form form={reportForm} layout="vertical">
            <Form.Item
              label="Chọn xe"
              name="vehicleId"
              rules={[
                { required: true, message: "Vui lòng chọn xe!" },
              ]}
            >
              <Select
                placeholder="Chọn xe cần báo cáo lỗi"
                loading={loadingVehicles}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={vehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.vin} - ${vehicle.modelName} (${vehicle.colorName})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Lý do"
              name="reason"
              rules={[
                { required: true, message: "Vui lòng nhập lý do!" },
                { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do báo cáo xe lỗi..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal tạo yêu cầu bảo hành */}
        <Modal
          open={warrantyModalOpen}
          onCancel={() => {
            setWarrantyModalOpen(false);
            warrantyForm.resetFields();
            setWarrantyVehicles([]);
            setSelectedOrderId(null);
          }}
          title="Tạo yêu cầu bảo hành/sửa chữa"
          onOk={handleCreateWarranty}
          okText="Tạo yêu cầu"
          cancelText="Hủy"
          width={600}
          destroyOnClose
        >
          <Form form={warrantyForm} layout="vertical">
            <Form.Item
              label="Chọn xe"
              name="vehicleId"
              rules={[
                { required: true, message: "Vui lòng chọn xe!" },
              ]}
            >
              <Select
                placeholder="Chọn xe cần bảo hành/sửa chữa"
                loading={loadingWarrantyVehicles}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={warrantyVehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.vin} - ${vehicle.modelName} (${vehicle.colorName})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Lý do"
              name="reason"
              rules={[
                { required: true, message: "Vui lòng nhập lý do!" },
                { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do yêu cầu bảo hành/sửa chữa..."
                maxLength={500}
                showCount
              />
            </Form.Item>
            {warrantyVehicles.length === 0 && !loadingWarrantyVehicles && (
              <div style={{ color: "#999", fontSize: "12px", marginTop: "-16px", marginBottom: "16px" }}>
                Không có xe nào trong đơn hàng này để tạo yêu cầu bảo hành.
              </div>
            )}
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
