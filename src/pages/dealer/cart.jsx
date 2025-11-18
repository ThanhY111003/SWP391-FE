// src/pages/dealer/cart.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  InputNumber,
  Space,
  message,
  Popconfirm,
  Descriptions,
  Empty,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  Checkbox,
} from "antd";
import {
  DeleteOutlined,
  ShoppingCartOutlined,
  MinusOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createOrderModalOpen, setCreateOrderModalOpen] = useState(false);
  const [createOrderForm] = Form.useForm();

  //  1. Load giỏ hàng
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/cart");
      if (res.data.success) {
        setCart(res.data.data);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải giỏ hàng!");
        setCart(null);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      // Nếu giỏ hàng trống, API có thể trả về lỗi
      const errorMsg =
        err.response?.data?.message || "Không thể tải giỏ hàng!";
      if (err.response?.status !== 404) {
        message.error(errorMsg);
      }
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  //  2. Cập nhật số lượng
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) {
      message.warning("Số lượng phải lớn hơn 0!");
      return;
    }

    try {
      const res = await apiClient.put(
        `/api/cart/items/${itemId}/quantity?quantity=${newQuantity}`
      );
      if (res.data.success) {
        message.success(res.data.message || "Cập nhật số lượng thành công!");
        fetchCart();
      } else {
        message.error(res.data.message || "Không thể cập nhật số lượng!");
        fetchCart(); // Reload để lấy dữ liệu mới nhất
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      console.error("Error response:", err.response);
      let errorMsg = "Không thể cập nhật số lượng!";
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      message.error(errorMsg);
      fetchCart(); // Reload để lấy dữ liệu mới nhất
    }
  };

  //  3. Xóa item khỏi giỏ hàng
  const handleRemoveItem = async (itemId) => {
    try {
      const res = await apiClient.delete(`/api/cart/items/${itemId}`);
      if (res.data.success) {
        message.success(res.data.message || "Đã xóa khỏi giỏ hàng!");
        fetchCart();
      } else {
        message.error(res.data.message || "Không thể xóa khỏi giỏ hàng!");
      }
    } catch (err) {
      console.error("Error removing item:", err);
      console.error("Error response:", err.response);
      let errorMsg = "Không thể xóa khỏi giỏ hàng!";
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      message.error(errorMsg);
    }
  };

  //  4. Xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    try {
      const res = await apiClient.delete("/api/cart/clear");
      if (res.data.success) {
        message.success(res.data.message || "Đã xóa toàn bộ giỏ hàng!");
        fetchCart();
      } else {
        message.error(res.data.message || "Không thể xóa giỏ hàng!");
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      console.error("Error response:", err.response);
      let errorMsg = "Không thể xóa giỏ hàng!";
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      message.error(errorMsg);
    }
  };

  //  5. Tạo đơn hàng từ giỏ hàng
  const handleCreateOrder = async () => {
    try {
      const values = await createOrderForm.validateFields();
      
      // Với API mới, chỉ có thể tạo đơn hàng cho 1 sản phẩm tại một thời điểm
      // Vì vậy, tạo nhiều đơn hàng cho từng item trong giỏ hàng
      const createdOrders = [];
      const failedOrders = [];
      
      for (const item of cart.items) {
        try {
          const orderData = {
            isInstallment: values.isInstallment || false,
            installmentMonths: values.isInstallment ? values.installmentMonths || 12 : 12,
            notes: values.notes || "",
            vehicleModelColorId: item.vehicleModelColorId
          };

          const res = await apiClient.post("/api/dealer/orders", orderData);
          if (res.data.success) {
            createdOrders.push({
              item: item,
              order: res.data.data,
              message: res.data.message
            });
          } else {
            failedOrders.push({
              item: item,
              error: res.data.message || "Không xác định"
            });
          }
        } catch (err) {
          failedOrders.push({
            item: item,
            error: err.response?.data?.message || err.message || "Không xác định"
          });
        }
      }

      // Hiển thị kết quả
      if (createdOrders.length > 0) {
        const totalAmount = createdOrders.reduce((sum, order) => sum + (order.order.totalAmount || 0), 0);
        
        // Thông báo thành công
        toast.success(
          (t) => (
            <div style={{ maxWidth: '450px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#fff' }}>
                ✅ Tạo thành công {createdOrders.length} đơn hàng
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e0e0e0' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#b0b0b0' }}>Tổng giá trị:</span>{' '}
                  <strong style={{ color: '#4caf50', fontSize: '15px' }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(totalAmount)}
                  </strong>
                </div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ color: '#b0b0b0', fontSize: '13px', marginBottom: '4px' }}>
                    Đơn hàng đã tạo:
                  </div>
                  {createdOrders.slice(0, 3).map((order, index) => (
                    <div key={index} style={{ fontSize: '13px', marginLeft: '8px', color: '#e0e0e0', marginBottom: '2px' }}>
                      • {order.order.orderCode} - {order.item.modelName} ({order.item.colorName})
                    </div>
                  ))}
                  {createdOrders.length > 3 && (
                    <div style={{ fontSize: '13px', marginLeft: '8px', color: '#b0b0b0' }}>
                      ... và {createdOrders.length - 3} đơn hàng khác
                    </div>
                  )}
                </div>
              </div>
            </div>
          ),
          {
            duration: 6000,
            position: 'top-right',
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            },
            iconTheme: {
              primary: '#4caf50',
              secondary: '#fff',
            },
          }
        );
        
        setCreateOrderModalOpen(false);
        createOrderForm.resetFields();
        
        // Xóa giỏ hàng sau khi tạo đơn thành công
        try {
          await apiClient.delete("/api/cart/clear");
        } catch (clearError) {
          console.warn("Error clearing cart:", clearError);
        }
        
        fetchCart();
        
        // Chuyển đến trang quản lý đơn hàng sau 1.5 giây
        setTimeout(() => {
          navigate("/dealer/orders");
        }, 1500);
      }
      
      // Hiển thị lỗi nếu có đơn hàng thất bại
      if (failedOrders.length > 0) {
        toast.error(
          `Có ${failedOrders.length} đơn hàng tạo thất bại. Vui lòng thử lại.`,
          {
            duration: 4000,
            position: 'top-right',
          }
        );
      }
      
      // Nếu tất cả đều thất bại
      if (createdOrders.length === 0) {
        message.error("Không thể tạo đơn hàng nào. Vui lòng thử lại!");
      }
      
    } catch (err) {
      console.error("Error creating orders:", err);
      message.error("Có lỗi xảy ra khi tạo đơn hàng!");
    }
  };

  //  6. Cấu hình cột Table
  const columns = [
    {
      title: "Model",
      key: "model",
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.modelName}</div>
          <Tag color="blue">{record.colorName}</Tag>
        </div>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (price) =>
        price
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)
          : "-",
    },
    {
      title: "Số lượng",
      key: "quantity",
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            icon={<MinusOutlined />}
            size="small"
            onClick={() => handleUpdateQuantity(record.id, record.quantity - 1)}
            disabled={record.quantity <= 1}
          />
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(value) => {
              if (value && value > 0) {
                handleUpdateQuantity(record.id, value);
              }
            }}
            style={{ width: 80 }}
          />
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleUpdateQuantity(record.id, record.quantity + 1)}
          />
        </Space>
      ),
    },
    {
      title: "Thành tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) =>
        price
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(price)
          : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 100,
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa"
          description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Xóa"
          cancelText="Hủy"
        >
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Xóa
          </Button>
        </Popconfirm>
      ),
    },
  ];

  if (loading) {
    return (
      <DealerLayout>
        <div className="p-6">Đang tải giỏ hàng...</div>
      </DealerLayout>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <DealerLayout>
        <div className="p-6">
          <Card>
            <Empty
              image={<ShoppingCartOutlined style={{ fontSize: 64 }} />}
              description="Giỏ hàng trống"
            />
            <div className="text-center mt-4">
              <Button type="primary" href="/dealer/vehicle-list">
                Xem danh sách xe
              </Button>
            </div>
          </Card>
        </div>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <Card
          title={
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <span>
                <ShoppingCartOutlined /> Giỏ hàng
              </span>
              <Popconfirm
                title="Xác nhận xóa toàn bộ"
                description="Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?"
                onConfirm={handleClearCart}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button type="primary" danger icon={<DeleteOutlined />} className="w-full sm:w-auto">
                  Xóa toàn bộ
                </Button>
              </Popconfirm>
            </div>
          }
        >
          <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
            <Descriptions.Item label="Đại lý">
              {cart.dealerName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">
              {cart.userFullName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số sản phẩm">
              {cart.items.length} sản phẩm
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền">
              <span className="text-xl font-bold text-green-600">
                {cart.cartTotal
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(cart.cartTotal)
                  : "0 VNĐ"}
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={cart.items}
            pagination={false}
            scroll={{ x: 'max-content' }}
            summary={(pageData) => {
              const total = cart.cartTotal || 0;
              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={3}>
                      <span className="font-semibold text-lg">Tổng cộng:</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <span className="text-xl font-bold text-green-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(total)}
                      </span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}></Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />

          {/* Nút tạo đơn hàng */}
          <div className="mt-4 sm:mt-6 text-center sm:text-right">
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={() => {
                createOrderForm.setFieldsValue({
                  isInstallment: false,
                  installmentMonths: 12,
                });
                setCreateOrderModalOpen(true);
              }}
              className="w-full sm:w-auto"
              style={{ height: "48px", paddingLeft: "32px", paddingRight: "32px" }}
            >
              Tạo đơn hàng
            </Button>
          </div>
        </Card>

        {/* Modal tạo đơn hàng */}
        <Modal
          open={createOrderModalOpen}
          onCancel={() => {
            setCreateOrderModalOpen(false);
            createOrderForm.resetFields();
          }}
          title="Tạo đơn hàng từ giỏ hàng"
          onOk={handleCreateOrder}
          okText="Tạo đơn hàng"
          cancelText="Hủy"
          width={{ xs: '90%', sm: 600 }}
        >
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Lưu ý:</strong> Hệ thống sẽ tạo riêng biệt {cart.items.length} đơn hàng cho từng sản phẩm trong giỏ hàng. 
              Cấu hình thanh toán sẽ được áp dụng cho tất cả các đơn hàng.
            </div>
          </div>
          
          <Form form={createOrderForm} layout="vertical">
            <Form.Item
              label="Hình thức thanh toán"
              name="isInstallment"
              valuePropName="checked"
              initialValue={false}
            >
              <Checkbox>Thanh toán trả góp</Checkbox>
            </Form.Item>

            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.isInstallment !== currentValues.isInstallment
              }
            >
              {({ getFieldValue }) =>
                getFieldValue("isInstallment") ? (
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
                        min: 1,
                        max: 60,
                        message: "Số tháng từ 1 đến 60!",
                      },
                    ]}
                    initialValue={12}
                  >
                    <Select placeholder="Chọn số tháng trả góp">
                      <Select.Option value={3}>3 tháng</Select.Option>
                      <Select.Option value={6}>6 tháng</Select.Option>
                      <Select.Option value={12}>12 tháng</Select.Option>
                      <Select.Option value={18}>18 tháng</Select.Option>
                      <Select.Option value={24}>24 tháng</Select.Option>
                      <Select.Option value={36}>36 tháng</Select.Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item label="Ghi chú chung" name="notes">
              <Input.TextArea
                rows={3}
                placeholder="Ghi chú sẽ được áp dụng cho tất cả đơn hàng (tùy chọn)"
                maxLength={1000}
                showCount
              />
            </Form.Item>

            {/* Preview đơn hàng */}
            <Card size="small" className="bg-gray-50">
              <div className="text-sm space-y-2">
                <div className="font-semibold mb-2">
                  Sẽ tạo {cart.items.length} đơn hàng:
                </div>
                {cart.items.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-200 pb-1">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    <span className="flex-1 mx-2">
                      {item.modelName} - {item.colorName} (x{item.quantity})
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(item.totalPrice)}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Tổng giá trị:</span>
                  <span className="text-green-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(cart.cartTotal)}
                  </span>
                </div>
              </div>
            </Card>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}

