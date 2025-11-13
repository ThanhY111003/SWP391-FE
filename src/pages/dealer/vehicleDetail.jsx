// src/pages/dealer/vehicleDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Image,
  Descriptions,
  Tag,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  message,
  Divider,
  Table,
  Badge,
} from "antd";
import {
  ShoppingCartOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import toast from "react-hot-toast";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

export default function VehicleDetail() {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [vehicleColors, setVehicleColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addToCartForm] = Form.useForm();

  //  1. Load chi tiết vehicle model
  const fetchVehicleDetail = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/api/vehicle-models/${modelId}`);
      if (res.data.success) {
        setVehicle(res.data.data);
      } else {
        message.error(res.data.message || "Không thể tải chi tiết xe!");
        navigate("/dealer/vehicle-list");
      }
    } catch (err) {
      console.error("Error fetching vehicle detail:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải chi tiết xe!";
      message.error(errorMsg);
      navigate("/dealer/vehicle-list");
    } finally {
      setLoading(false);
    }
  };

  //  2. Load màu của vehicle model
  const fetchVehicleColors = async () => {
    try {
      const res = await apiClient.get(`/api/vehicle-models/${modelId}/colors`);
      if (res.data.success) {
        setVehicleColors(res.data.data.filter((c) => c.isActive));
      } else {
        message.error(res.data.message || "Không thể tải danh sách màu!");
      }
    } catch (err) {
      console.error("Error fetching vehicle colors:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách màu!";
      message.error(errorMsg);
    }
  };

  useEffect(() => {
    if (modelId) {
      fetchVehicleDetail();
      fetchVehicleColors();
    }
  }, [modelId]);

  //  3. Mở modal thêm vào giỏ hàng
  const openAddToCartModal = (color) => {
    setSelectedColor(color);
    addToCartForm.resetFields();
    addToCartForm.setFieldsValue({
      vehicleModelColorId: color.id,
      quantity: 1,
    });
    setAddToCartModalOpen(true);
  };

  //  4. Thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      const values = await addToCartForm.validateFields();
      const payload = {
        vehicleModelColorId: values.vehicleModelColorId,
        quantity: values.quantity,
      };

      const res = await apiClient.post("/api/cart/items", payload);
      if (res.data.success) {
        const cartData = res.data.data;
        const responseMessage = res.data.message || "Đã thêm vào giỏ hàng thành công!";
        const addedItem = cartData?.items?.[cartData.items.length - 1]; // Lấy item vừa thêm (item cuối cùng)
        
        // Thông báo thành công với thông tin chi tiết bằng toast
        toast.success(
          (t) => (
            <div style={{ maxWidth: '400px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px', color: '#fff' }}>
                ✅ {responseMessage}
              </div>
              {addedItem && (
                <div style={{ fontSize: '14px', lineHeight: '1.6', color: '#e0e0e0' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#b0b0b0' }}>Sản phẩm:</span>{' '}
                    <strong style={{ color: '#4fc3f7' }}>
                      {addedItem.modelName} - {addedItem.colorName}
                    </strong>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#b0b0b0' }}>Số lượng:</span>{' '}
                    <strong style={{ color: '#fff' }}>{addedItem.quantity}</strong>
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#b0b0b0' }}>Giá:</span>{' '}
                    <strong style={{ color: '#4caf50' }}>
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(addedItem.totalPrice)}
                    </strong>
                  </div>
                  {cartData?.cartTotal && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <span style={{ color: '#b0b0b0' }}>Tổng giỏ hàng:</span>{' '}
                      <strong style={{ color: '#4caf50', fontSize: '15px' }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(cartData.cartTotal)}
                      </strong>
                    </div>
                  )}
                </div>
              )}
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
        
        setAddToCartModalOpen(false);
        addToCartForm.resetFields();
        setSelectedColor(null);
      } else {
        toast.error(res.data.message || "Không thể thêm vào giỏ hàng!", {
          position: 'top-right',
        });
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      console.error("Error response:", err.response);
      let errorMsg = "Không thể thêm vào giỏ hàng!";
      if (err.response?.data) {
        errorMsg = err.response.data.message || err.response.data.error || errorMsg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      toast.error(errorMsg, {
        position: 'top-right',
      });
    }
  };

  //  5. Cấu hình cột cho bảng màu
  const colorColumns = [
    {
      title: "Màu",
      key: "color",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded border-2 border-gray-300"
            style={{ backgroundColor: record.hexCode || "#FFFFFF" }}
          ></div>
          <span className="font-medium">{record.colorName}</span>
        </div>
      ),
    },
    {
      title: "Mã màu",
      dataIndex: "hexCode",
      key: "hexCode",
      render: (hex) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {hex || "N/A"}
        </code>
      ),
    },
    {
      title: "Chênh lệch giá",
      dataIndex: "priceAdjustment",
      key: "priceAdjustment",
      render: (adjustment) => (
        <span
          className={
            adjustment > 0
              ? "text-green-600"
              : adjustment < 0
              ? "text-red-600"
              : "text-gray-600"
          }
        >
          {adjustment > 0 ? "+" : ""}
          {adjustment
            ? new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(adjustment)
            : "0 VNĐ"}
        </span>
      ),
    },
    {
      title: "Giá hiệu lực",
      key: "effectivePrice",
      render: (_, record) => {
        const basePrice = vehicle?.manufacturerPrice || 0;
        const effectivePrice = basePrice + (record.priceAdjustment || 0);
        return (
          <span className="font-semibold text-green-600">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(effectivePrice)}
          </span>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<ShoppingCartOutlined />}
          onClick={() => openAddToCartModal(record)}
        >
          Thêm vào giỏ
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <DealerLayout>
        <div className="p-6">Đang tải...</div>
      </DealerLayout>
    );
  }

  if (!vehicle) {
    return (
      <DealerLayout>
        <div className="p-6">
          <Card>
            <p>Không tìm thấy thông tin xe.</p>
            <Button onClick={() => navigate("/dealer/vehicle-list")}>
              Quay lại danh sách
            </Button>
          </Card>
        </div>
      </DealerLayout>
    );
  }

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/dealer/vehicle-list")}
          className="mb-4"
        >
          Quay lại
        </Button>

        <Row gutter={[24, 24]}>
          {/* Thông tin chi tiết xe */}
          <Col xs={24} lg={16}>
            <Card title={vehicle.name} className="mb-4">
              {vehicle.imageUrl && (
                <div className="mb-4">
                  <Image
                    width="100%"
                    height={400}
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                    fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Ob0ltYWdlPC90ZXh0Pjwvc3ZnPg=="
                  />
                </div>
              )}

              <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }}>
                <Descriptions.Item label="Thương hiệu">
                  {vehicle.brand}
                </Descriptions.Item>
                <Descriptions.Item label="Mã model">
                  {vehicle.modelCode}
                </Descriptions.Item>
                <Descriptions.Item label="Năm sản xuất">
                  {vehicle.year}
                </Descriptions.Item>
                <Descriptions.Item label="Giá nhà sản xuất">
                  <span className="font-semibold text-green-600">
                    {vehicle.manufacturerPrice
                      ? new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(vehicle.manufacturerPrice)
                      : "N/A"}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Quãng đường">
                  {vehicle.rangeKm ? `${vehicle.rangeKm} km` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Dung lượng pin">
                  {vehicle.batteryCapacity
                    ? `${vehicle.batteryCapacity} kWh`
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian sạc">
                  {vehicle.chargingTime
                    ? `${vehicle.chargingTime} phút`
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Tốc độ tối đa">
                  {vehicle.maxSpeed ? `${vehicle.maxSpeed} km/h` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Gia tốc (0-100km/h)">
                  {vehicle.acceleration
                    ? `${vehicle.acceleration}s`
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Số chỗ ngồi">
                  {vehicle.seatingCapacity
                    ? `${vehicle.seatingCapacity} chỗ`
                    : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Dung tích cốp">
                  {vehicle.cargoVolume ? `${vehicle.cargoVolume} L` : "N/A"}
                </Descriptions.Item>
                <Descriptions.Item label="Mô tả" span={2}>
                  {vehicle.description || "Chưa có mô tả"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Badge
                    status={vehicle.isActive ? "success" : "error"}
                    text={vehicle.isActive ? "Đang hoạt động" : "Vô hiệu hóa"}
                  />
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Danh sách màu và thêm vào giỏ hàng */}
          <Col xs={24} lg={8}>
            <Card title="Màu sắc có sẵn" className="mb-4">
              {vehicleColors.length > 0 ? (
                <Table
                  dataSource={vehicleColors}
                  columns={colorColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  scroll={{ x: 600 }}
                />
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Xe này chưa có màu sắc nào.
                </p>
              )}
            </Card>
          </Col>
        </Row>

        {/* Modal thêm vào giỏ hàng */}
        <Modal
          open={addToCartModalOpen}
          onCancel={() => {
            setAddToCartModalOpen(false);
            addToCartForm.resetFields();
            setSelectedColor(null);
          }}
          title={`Thêm vào giỏ hàng - ${vehicle?.name} (${selectedColor?.colorName || ""})`}
          onOk={handleAddToCart}
          okText="Thêm vào giỏ"
          cancelText="Hủy"
          width={{ xs: '90%', sm: 400 }}
          destroyOnClose
        >
          <Form form={addToCartForm} layout="vertical">
            <Form.Item name="vehicleModelColorId" hidden>
              <input type="hidden" />
            </Form.Item>

            <Form.Item
              label="Số lượng"
              name="quantity"
              rules={[
                { required: true, message: "Vui lòng nhập số lượng!" },
                {
                  type: "number",
                  min: 1,
                  message: "Số lượng phải lớn hơn 0!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="Nhập số lượng"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}

