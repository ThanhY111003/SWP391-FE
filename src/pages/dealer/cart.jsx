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
      const orderData = {
        isInstallment: values.isInstallment || false,
        installmentMonths: values.isInstallment
          ? values.installmentMonths || 12
          : 0,
        notes: values.notes || "",
        orderDetails: cart.items.map((item) => ({
          // Lấy modelColorId từ item trong cart response
          vehicleModelColorId: item.vehicleModelColorId,
          quantity: item.quantity,
        })),
      };

      const res = await apiClient.post("/api/dealer/orders", orderData);
      if (res.data.success) {
        message.success("Tạo đơn hàng thành công!");
        setCreateOrderModalOpen(false);
        createOrderForm.resetFields();
        // Xóa giỏ hàng sau khi tạo đơn thành công
        const clearRes = await apiClient.delete("/api/cart/clear");
        if (clearRes.data.success && clearRes.data.message) {
          message.success(clearRes.data.message);
        }
        fetchCart();
        // Chuyển đến trang quản lý đơn hàng
        navigate("/dealer/orders");
      } else {
        message.error(res.data.message || "Tạo đơn hàng thất bại!");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      console.error("Error response:", err.response);
      let errorMsg = "Không thể tạo đơn hàng!";
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      message.error(errorMsg);
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
      <div className="p-6">
        <Card
          title={
            <div className="flex justify-between items-center">
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
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Xóa toàn bộ
                </Button>
              </Popconfirm>
            </div>
          }
        >
          <Descriptions bordered column={2} className="mb-4">
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
          <div className="mt-6 text-right">
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
          width={600}
        >
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
                      <Select.Option value={48}>48 tháng</Select.Option>
                      <Select.Option value={60}>60 tháng</Select.Option>
                    </Select>
                  </Form.Item>
                ) : null
              }
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <Input.TextArea
                rows={3}
                placeholder="Ghi chú cho đơn hàng (tùy chọn)"
                maxLength={1000}
                showCount
              />
            </Form.Item>

            {/* Preview đơn hàng */}
            <Card size="small" className="bg-gray-50">
              <div className="text-sm space-y-2">
                <div className="font-semibold mb-2">Tóm tắt đơn hàng:</div>
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
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
                  <span>Tổng cộng:</span>
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

