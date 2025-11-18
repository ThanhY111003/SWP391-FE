// src/pages/dealer/createOrder.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Form,
  Select,
  Checkbox,
  Input,
  Button,
  message,
  Descriptions,
  Spin,
} from "antd";
import { ShoppingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { TextArea } = Input;

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [vehicleModelColors, setVehicleModelColors] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);


  const preSelectedVehicleId = searchParams.get('vehicleModelColorId');

  useEffect(() => {
    fetchVehicleModelColors();
  }, []);

  useEffect(() => {
    if (preSelectedVehicleId && vehicleModelColors.length > 0) {
      const selected = vehicleModelColors.find(v => v.id === parseInt(preSelectedVehicleId));
      if (selected) {
        form.setFieldsValue({ vehicleModelColorId: selected.id });
        setSelectedVehicle(selected);
      }
    }
  }, [preSelectedVehicleId, vehicleModelColors, form]);

  const fetchVehicleModelColors = async () => {
    setLoadingVehicles(true);
    try {
      const res = await apiClient.get("/api/vehicle-model-colors");
      if (res.data.success) {
        setVehicleModelColors(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
        setVehicleModelColors([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle model colors:", err);
      message.error("Không thể tải danh sách xe!");
      setVehicleModelColors([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Handle vehicle selection change
  const handleVehicleChange = (vehicleId) => {
    const selected = vehicleModelColors.find(v => v.id === vehicleId);
    setSelectedVehicle(selected);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const orderData = {
        isInstallment: values.isInstallment || false,
        installmentMonths: values.isInstallment ? values.installmentMonths || 12 : 12,
        notes: values.notes || "",
        vehicleModelColorId: values.vehicleModelColorId
      };

      const res = await apiClient.post("/api/dealer/orders", orderData);
      
      if (res.data.success) {
        const orderInfo = res.data.data;
        
        // Show success toast with order details
        toast.success(
          (t) => (
            <div style={{ maxWidth: '400px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#fff' }}>
                ✅ Tạo đơn hàng thành công!
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e0e0e0' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#b0b0b0' }}>Mã đơn hàng:</span>{' '}
                  <strong style={{ color: '#4fc3f7' }}>{orderInfo.orderCode}</strong>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#b0b0b0' }}>Tổng tiền:</span>{' '}
                  <strong style={{ color: '#4caf50', fontSize: '15px' }}>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(orderInfo.totalAmount)}
                  </strong>
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#b0b0b0' }}>Trạng thái:</span>{' '}
                  <strong style={{ color: '#ffb74d' }}>
                    {orderInfo.status || 'PENDING'}
                  </strong>
                </div>
              </div>
            </div>
          ),
          {
            duration: 5000,
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

        // Navigate to order detail after 1 second
        setTimeout(() => {
          navigate(`/dealer/orders/${orderInfo.id}`);
        }, 1000);
        
      } else {
        message.error(res.data.message || "Tạo đơn hàng thất bại!");
      }
    } catch (err) {
      console.error("Error creating order:", err);
      const errorMsg = err.response?.data?.message || err.message || "Không thể tạo đơn hàng!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <div className="mb-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/dealer/orders")}
            style={{ marginBottom: "16px" }}
          >
            Quay lại danh sách đơn hàng
          </Button>
        </div>

        <Card 
          title={
            <div className="flex items-center gap-2">
              <ShoppingOutlined />
              <span>Tạo đơn hàng mới</span>
            </div>
          }
          loading={loadingVehicles}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              isInstallment: false,
              installmentMonths: 12,
            }}
          >
            <Form.Item
              label="Chọn xe"
              name="vehicleModelColorId"
              rules={[
                { required: true, message: "Vui lòng chọn xe!" }
              ]}
            >
              <Select
                placeholder="Chọn model xe và màu sắc"
                onChange={handleVehicleChange}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={vehicleModelColors.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.modelName} - ${vehicle.colorName}`,
                }))}
              />
            </Form.Item>

            {/* Preview selected vehicle */}
            {selectedVehicle && (
              <Card size="small" className="mb-4 bg-blue-50">
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Model xe">
                    <strong>{selectedVehicle.modelName}</strong>
                  </Descriptions.Item>
                  <Descriptions.Item label="Màu sắc">
                    <strong>{selectedVehicle.colorName}</strong>
                  </Descriptions.Item>
                  {selectedVehicle.price && (
                    <Descriptions.Item label="Giá">
                      <strong className="text-green-600">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(selectedVehicle.price)}
                      </strong>
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            )}

            <Form.Item
              label="Hình thức thanh toán"
              name="isInstallment"
              valuePropName="checked"
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
                    ]}
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

            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <TextArea
                rows={4}
                placeholder="Nhập ghi chú cho đơn hàng (tùy chọn)"
                maxLength={1000}
                showCount
              />
            </Form.Item>

            <Form.Item>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => navigate("/dealer/orders")}
                >
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<ShoppingOutlined />}
                  size="large"
                >
                  Tạo đơn hàng
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </DealerLayout>
  );
}