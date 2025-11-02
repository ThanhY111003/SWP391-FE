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
  Descriptions,
  Space,
  Progress,
  Typography,
  Checkbox,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import DealerLayout from "../components/dealerlayout";

const { Option } = Select;
const { Text } = Typography;

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [open, setOpen] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form] = Form.useForm();

  //  Thêm: lưu bảng giá hiệu lực hiện tại
  const [priceTable, setPriceTable] = useState(null);
  // Thêm: danh sách vehicle model colors
  const [vehicleModelColors, setVehicleModelColors] = useState([]);

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
      console.error("Error fetching orders:", err);
      message.error("Failed to load orders");
      setOrders([]);
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
      console.error("Error fetching price table:", err);
      // Show error message but don't block the page
      console.log("Price table API not available");
      setPriceTable(null);
    }
  };

  // 3. Fetch vehicle models và colors
  const fetchVehicleModelsAndColors = async () => {
    setLoadingColors(true);
    try {
      // Lấy danh sách vehicle models
      const modelsRes = await api.get("/vehicle-models");
      console.log("Vehicle models API Response:", modelsRes.data);

      if (
        modelsRes.data &&
        (Array.isArray(modelsRes.data) || modelsRes.data.data)
      ) {
        const models = Array.isArray(modelsRes.data)
          ? modelsRes.data
          : modelsRes.data.data;

        // Lấy màu sắc cho từng model
        const allModelColors = [];

        for (const model of models) {
          try {
            const colorsRes = await api.get(
              `/vehicle-models/${model.id}/colors`
            );
            console.log(`Colors for model ${model.id}:`, colorsRes.data);

            if (
              colorsRes.data &&
              (Array.isArray(colorsRes.data) || colorsRes.data.data)
            ) {
              const colors = Array.isArray(colorsRes.data)
                ? colorsRes.data
                : colorsRes.data.data;

              // Thêm thông tin model vào mỗi màu
              colors.forEach((color) => {
                allModelColors.push({
                  id: color.id,
                  vehicleModelId: color.vehicleModelId,
                  vehicleModelName: model.name,
                  colorId: color.colorId,
                  colorName: color.colorName,
                  hexCode: color.hexCode,
                  priceAdjustment: color.priceAdjustment || 0,
                  basePrice: model.basePrice || 0,
                  price: (model.basePrice || 0) + (color.priceAdjustment || 0),
                  isActive: color.isActive,
                });
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch colors for model ${model.id}:`, err);
          }
        }

        // Chỉ lấy những màu đang active
        const activeColors = allModelColors.filter((color) => color.isActive);
        setVehicleModelColors(activeColors);
        console.log("Vehicle model colors loaded:", activeColors);

        if (activeColors.length === 0) {
          message.warning(
            "Chưa có màu sắc nào được cấu hình cho các vehicle models"
          );
        }
      } else {
        console.log("No vehicle models data received from API");
        setVehicleModelColors([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle models and colors:", err);
      message.error("Không thể tải danh sách xe và màu sắc");
      setVehicleModelColors([]);
    } finally {
      setLoadingColors(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPriceTable(); // ✅ Gọi thêm API bảng giá
    fetchVehicleModelsAndColors(); // ✅ Gọi thêm API vehicle models và colors
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Handle view order detail
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  //  3. Modal mở để thêm/sửa đơn
  const openModal = (record = null) => {
    setEditingOrder(record);
    if (record) {
      // For editing, set the form values from the record
      form.setFieldsValue({
        orderCode: record.orderCode,
        notes: record.notes,
        isInstallment: record.isInstallment,
        installmentMonths: record.installmentMonths || 12,
        // For editing, we'll need to find the vehicleModelColorId from orderDetails
        vehicleModelColorId: record.orderDetails?.[0]?.vehicleModelColorId,
        quantity: record.orderDetails?.[0]?.quantity || 1,
      });
    } else {
      // For new orders, reset the form
      form.resetFields();
      // Set some default values
      form.setFieldsValue({
        isInstallment: false,
        quantity: 1,
        installmentMonths: 12,
      });
    }
    setOpen(true);
  };

  //  4. Submit form tạo / sửa đơn
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      console.log("Form values:", values);

      if (editingOrder) {
        // Update existing order - keep the old logic for now
        try {
          const res = await api.put(
            `/dealer/orders/${editingOrder.id}`,
            values
          );
          if (res.data && res.data.success) {
            message.success("Cập nhật đơn hàng thành công!");
            fetchOrders(); // Reload data
          } else {
            message.error("Cập nhật đơn hàng thất bại!");
          }
        } catch (err) {
          console.error("Error updating order:", err);
          message.error("Cập nhật đơn hàng thất bại!");
        }
      } else {
        // Create new order - use new API format
        try {
          const isInstallmentPayment = values.paymentMethod === "INSTALLMENT";

          const orderData = {
            isInstallment: isInstallmentPayment,
            installmentMonths: isInstallmentPayment
              ? values.installmentMonths || 12
              : 0,
            notes: values.notes || "",
            orderDetails: [
              {
                vehicleModelColorId: values.vehicleModelColorId,
                quantity: values.quantity || 1,
              },
            ],
          };

          console.log("Sending order data:", orderData);

          const res = await api.post("/dealer/orders", orderData);
          console.log("Create order response:", res.data);

          if (res.data && res.data.success) {
            message.success("Tạo đơn hàng thành công!");
            fetchOrders(); // Reload data
            setOpen(false);
            form.resetFields();
          } else {
            message.error(res.data?.message || "Tạo đơn hàng thất bại!");
          }
        } catch (err) {
          console.error("Error creating order:", err);
          const errorMessage =
            err.response?.data?.message || "Tạo đơn hàng thất bại!";
          message.error(errorMessage);
        }
      }
    } catch (err) {
      console.error("Form validation failed:", err);
      message.error("Vui lòng kiểm tra thông tin nhập vào!");
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
      console.error("Error deleting order:", err);
      message.error("Xóa đơn hàng thất bại!");
    }
  };

  //  6. Render trạng thái đơn
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

  //  7. Cấu hình bảng
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
          className="p-0 h-auto font-medium"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => formatDate(date),
    },
    {
      title: "Vehicle Details",
      key: "vehicleDetails",
      render: (_, record) => {
        const details = record.orderDetails || [];
        return (
          <div className="space-y-2">
            {details.map((detail, index) => (
              <div key={index} className="text-sm">
                <div className="font-medium">{detail.vehicleModelName}</div>
                <div className="text-gray-500">
                  {detail.vehicleColorName} • Qty: {detail.quantity}
                </div>
                <div className="text-xs text-blue-600">
                  {formatCurrency(detail.unitPrice)} × {detail.quantity} ={" "}
                  {formatCurrency(detail.totalPrice)}
                </div>
              </div>
            ))}
          </div>
        );
      },
      width: 250,
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      width: 150,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Payment Progress",
      key: "paymentProgress",
      render: (_, record) => (
        <div>
          <Progress
            percent={record.paymentProgress}
            size="small"
            strokeColor={record.paymentProgress === 100 ? "#52c41a" : "#1890ff"}
          />
          <div className="text-xs text-gray-500 mt-1">
            Paid: {formatCurrency(record.paidAmount)}
          </div>
          <div className="text-xs text-gray-500">
            Remaining: {formatCurrency(record.remainingAmount)}
          </div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: renderStatus,
      width: 120,
    },
    {
      title: "Payment Type",
      key: "paymentType",
      render: (_, record) => (
        <Tag color={record.isInstallment ? "blue" : "green"}>
          {record.isInstallment ? "Installment" : "Full Payment"}
        </Tag>
      ),
      width: 120,
    },
    {
      title: "Created By",
      key: "createdBy",
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium">{record.createdBy?.fullName}</div>
          <div className="text-gray-500">@{record.createdBy?.username}</div>
        </div>
      ),
      width: 150,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            View
          </Button>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete this order?"
            description="Are you sure you want to delete this order?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      width: 200,
      fixed: "right",
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
            <p className="text-sm text-gray-500 mt-1">
              Xem danh sách tất cả đơn hàng thuộc dealer hiện tại
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openModal()}
          >
            Tạo đơn hàng mới
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
                    <strong>{formatCurrency(item.price)}</strong>
                  </li>
                ))}
            </ul>
          </Card>
        )}

        {/* ✅ Hiển thị các model và màu có sẵn */}
        {loadingColors ? (
          <Card
            className="mb-6"
            title="🚗 Danh sách xe và màu sắc có sẵn"
            size="small"
          >
            <div className="text-center py-8">
              <div className="text-gray-500">
                Đang tải danh sách xe và màu sắc...
              </div>
            </div>
          </Card>
        ) : vehicleModelColors.length > 0 ? (
          <Card
            className="mb-6"
            title="🚗 Danh sách xe và màu sắc có sẵn"
            size="small"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const groupedByModel = vehicleModelColors.reduce(
                  (acc, item) => {
                    const modelName = item.vehicleModelName;
                    if (!acc[modelName]) acc[modelName] = [];
                    acc[modelName].push(item);
                    return acc;
                  },
                  {}
                );

                return Object.entries(groupedByModel).map(
                  ([modelName, colors]) => (
                    <div
                      key={modelName}
                      className="border rounded-lg p-3 bg-gray-50"
                    >
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {modelName}
                      </h4>
                      <div className="space-y-2">
                        {colors.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                style={{
                                  width: 16,
                                  height: 16,
                                  backgroundColor: item.hexCode || "#cccccc",
                                  border: "1px solid #d9d9d9",
                                  borderRadius: 3,
                                }}
                              />
                              <span className="text-sm">{item.colorName}</span>
                            </div>
                            <span className="text-xs text-green-600 font-medium">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                );
              })()}
            </div>
          </Card>
        ) : (
          <Card
            className="mb-6"
            title="🚗 Danh sách xe và màu sắc có sẵn"
            size="small"
          >
            <div className="text-center py-8">
              <div className="text-gray-500 mb-2">
                Chưa có xe và màu sắc nào được cấu hình
              </div>
              <div className="text-sm text-gray-400">
                Vui lòng liên hệ admin để thêm màu sắc cho các model xe
              </div>
            </div>
          </Card>
        )}

        <Table
          rowKey="id"
          columns={columns}
          dataSource={orders}
          loading={loading}
          bordered
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} đơn hàng`,
          }}
          locale={{
            emptyText: loading ? "Đang tải..." : "Chưa có đơn hàng nào",
          }}
        />

        {/* Order Creation/Edit Modal */}
        <Modal
          open={open}
          onCancel={() => setOpen(false)}
          title={editingOrder ? "Cập nhật đơn hàng" : "Tạo đơn hàng mới"}
          onOk={handleSubmit}
          okText="Lưu"
          cancelText="Hủy"
          width={600}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Chọn xe và màu sắc"
              name="vehicleModelColorId"
              rules={[
                { required: true, message: "Vui lòng chọn model và màu xe!" },
              ]}
            >
              <Select
                placeholder={
                  loadingColors
                    ? "Đang tải dữ liệu..."
                    : "Chọn model xe và màu sắc"
                }
                showSearch
                loading={loadingColors}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.children?.toLowerCase().includes(input.toLowerCase())
                }
                size="large"
                notFoundContent={
                  loadingColors ? (
                    <div className="text-center py-4">
                      <div>Đang tải danh sách xe và màu sắc...</div>
                    </div>
                  ) : vehicleModelColors.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-gray-500">
                        Chưa có xe và màu sắc nào được cấu hình
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Vui lòng liên hệ admin để thêm màu sắc cho các model xe
                      </div>
                    </div>
                  ) : (
                    "Không tìm thấy"
                  )
                }
              >
                {(() => {
                  // Nhóm theo vehicle model
                  const groupedByModel = vehicleModelColors.reduce(
                    (acc, item) => {
                      const modelName = item.vehicleModelName;
                      if (!acc[modelName]) acc[modelName] = [];
                      acc[modelName].push(item);
                      return acc;
                    },
                    {}
                  );

                  return Object.entries(groupedByModel).map(
                    ([modelName, colors]) => (
                      <Select.OptGroup
                        key={modelName}
                        label={
                          <span className="font-semibold text-gray-700">
                            {modelName}
                          </span>
                        }
                      >
                        {colors.map((item) => (
                          <Option key={item.id} value={item.id}>
                            <div className="flex items-center justify-between py-1">
                              <div className="flex items-center space-x-3">
                                <div
                                  style={{
                                    width: 20,
                                    height: 20,
                                    backgroundColor: item.hexCode || "#cccccc",
                                    border: "2px solid #d9d9d9",
                                    borderRadius: 4,
                                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <div>
                                  <div className="font-medium">
                                    {item.colorName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.hexCode}
                                  </div>
                                </div>
                              </div>
                              <div className="text-green-600 font-bold">
                                {formatCurrency(item.price)}
                              </div>
                            </div>
                          </Option>
                        ))}
                      </Select.OptGroup>
                    )
                  );
                })()}
              </Select>
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" },
              ]}
            >
              <InputNumber min={1} max={100} className="w-full" />
            </Form.Item>

            <Form.Item
              label="Hình thức thanh toán"
              name="paymentMethod"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn hình thức thanh toán!",
                },
              ]}
            >
              <Select placeholder="Chọn hình thức thanh toán">
                <Option value="FULL_PAYMENT">Thanh toán đủ (một lần)</Option>
                <Option value="INSTALLMENT">Trả góp</Option>
              </Select>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.paymentMethod !== currentValues.paymentMethod
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("paymentMethod") === "INSTALLMENT" ? (
                  <Form.Item
                    label="Số tháng trả góp"
                    name="installmentMonths"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn số tháng trả góp!",
                      },
                      {
                        type: "number",
                        min: 3,
                        max: 60,
                        message: "Số tháng từ 3 đến 60!",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn số tháng trả góp">
                      <Option value={3}>3 tháng</Option>
                      <Option value={6}>6 tháng</Option>
                      <Option value={12}>12 tháng</Option>
                      <Option value={18}>18 tháng</Option>
                      <Option value={24}>24 tháng</Option>
                      <Option value={36}>36 tháng</Option>
                      <Option value={48}>48 tháng</Option>
                      <Option value={60}>60 tháng</Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea rows={3} placeholder="Ghi chú cho đơn hàng..." />
            </Form.Item>

            {/* Preview section for new orders */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.vehicleModelColorId !==
                  currentValues.vehicleModelColorId ||
                prevValues.quantity !== currentValues.quantity ||
                prevValues.paymentMethod !== currentValues.paymentMethod ||
                prevValues.installmentMonths !== currentValues.installmentMonths
              }
            >
              {({ getFieldValue }) => {
                const selectedVehicleId = getFieldValue("vehicleModelColorId");
                const quantity = getFieldValue("quantity") || 1;
                const paymentMethod = getFieldValue("paymentMethod");
                const installmentMonths = getFieldValue("installmentMonths");

                const selectedVehicle = vehicleModelColors.find(
                  (v) => v.id === selectedVehicleId
                );

                if (selectedVehicle && !editingOrder) {
                  const totalAmount = selectedVehicle.price * quantity;
                  const isInstallment = paymentMethod === "INSTALLMENT";

                  return (
                    <Card
                      title="🔍 Preview đơn hàng"
                      size="small"
                      className="bg-gray-50 border-2 border-blue-200"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div
                            style={{
                              width: 24,
                              height: 24,
                              backgroundColor:
                                selectedVehicle.hexCode || "#cccccc",
                              border: "2px solid #d9d9d9",
                              borderRadius: 4,
                            }}
                          />
                          <div>
                            <div className="font-medium text-base">
                              {selectedVehicle.vehicleModelName}
                            </div>
                            <div className="text-gray-600">
                              Màu: {selectedVehicle.colorName} (
                              {selectedVehicle.hexCode})
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Số lượng:</span>
                            <span className="ml-2 font-medium">
                              {quantity} xe
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Đơn giá:</span>
                            <span className="ml-2 font-medium text-blue-600">
                              {formatCurrency(selectedVehicle.price)}
                            </span>
                          </div>
                        </div>

                        <div className="border-t pt-2">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-medium">
                              Tổng tiền:
                            </span>
                            <span className="text-xl font-bold text-green-600">
                              {formatCurrency(totalAmount)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Hình thức:{" "}
                            {isInstallment
                              ? `Trả góp ${installmentMonths} tháng`
                              : "Thanh toán đủ (một lần)"}
                          </div>
                          {isInstallment && installmentMonths && (
                            <div className="text-sm text-orange-600 mt-1">
                              Tiền trả góp/tháng:{" "}
                              {formatCurrency(totalAmount / installmentMonths)}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                }
                return null;
              }}
            </Form.Item>
          </Form>
        </Modal>

        {/* Order Detail Modal */}
        <Modal
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          title={
            <span>
              <EyeOutlined className="mr-2" />
              Chi tiết đơn hàng
            </span>
          }
          width={1000}
          footer={null}
        >
          {selectedOrder && (
            <div>
              {/* Basic Order Info */}
              <Card className="mb-4">
                <Descriptions title="Thông tin đơn hàng" bordered column={2}>
                  <Descriptions.Item label="Mã đơn hàng">
                    <Text strong>{selectedOrder.orderCode}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {renderStatus(selectedOrder.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo đơn">
                    {formatDate(selectedOrder.orderDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    <Text strong className="text-lg">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiền đặt cọc">
                    {formatCurrency(selectedOrder.depositAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Đã thanh toán">
                    {formatCurrency(selectedOrder.paidAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Còn lại">
                    <Text
                      type={
                        selectedOrder.remainingAmount > 0
                          ? "warning"
                          : "success"
                      }
                    >
                      {formatCurrency(selectedOrder.remainingAmount)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tiến độ thanh toán">
                    <Progress percent={selectedOrder.paymentProgress} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Hình thức thanh toán">
                    <Tag color={selectedOrder.isInstallment ? "blue" : "green"}>
                      {selectedOrder.isInstallment
                        ? "Trả góp"
                        : "Thanh toán đủ"}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày thanh toán đủ">
                    {formatDate(selectedOrder.fullPaymentDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người tạo đơn">
                    <div className="text-sm">
                      <div className="font-medium">
                        {selectedOrder.createdBy?.fullName}
                      </div>
                      <div className="text-gray-500">
                        @{selectedOrder.createdBy?.username}
                      </div>
                    </div>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ghi chú" span={2}>
                    {selectedOrder.notes || "Không có ghi chú"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Dealer Information */}
              {selectedOrder.dealer && (
                <Card title="Thông tin đại lý" className="mb-4">
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Tên đại lý">
                      {selectedOrder.dealer.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã đại lý">
                      {selectedOrder.dealer.code}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cấp độ">
                      <Tag color="blue">{selectedOrder.dealer.levelName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Công nợ hiện tại">
                      <Text
                        type={
                          selectedOrder.dealer.currentDebt > 0
                            ? "danger"
                            : "success"
                        }
                      >
                        {formatCurrency(selectedOrder.dealer.currentDebt)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hạn mức tín dụng">
                      {formatCurrency(selectedOrder.dealer.availableCredit)}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>
              )}

              {/* Order Details */}
              <Card title="Chi tiết sản phẩm" className="mb-4">
                <Table
                  dataSource={selectedOrder.orderDetails}
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
                  <Card title="Kế hoạch trả góp">
                    <Table
                      dataSource={selectedOrder.installmentPlans}
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
                              {record.isOverdue && (
                                <Tag color="red">Quá hạn</Tag>
                              )}
                            </Space>
                          ),
                        },
                      ]}
                    />
                  </Card>
                )}

              {/* Created By */}
              <Card title="Thông tin tạo đơn" className="mt-4">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Người tạo">
                    {selectedOrder.createdBy?.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Username">
                    {selectedOrder.createdBy?.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {formatDate(selectedOrder.createdAt)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày cập nhật">
                    {formatDate(selectedOrder.updatedAt)}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>
          )}
        </Modal>
      </div>
    </DealerLayout>
  );
}
