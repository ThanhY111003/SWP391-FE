// src/pages/dealer/vehicleList.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Tag,
  Select,
  Input,
  Row,
  Col,
  Image,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  message,
  Badge,
  Empty,
  Spin,
  Typography,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  ThunderboltOutlined,
  CarOutlined,
  PoweroffOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Search } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

export default function VehicleList() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brandFilter, setBrandFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleColors, setVehicleColors] = useState([]);
  const [addToCartForm] = Form.useForm();

  //  1. Load danh sách vehicle models
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/vehicle-models");
      if (res.data.success) {
        // Chỉ hiển thị các xe đang active
        setVehicles(res.data.data.filter((v) => v.isActive));
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  //  2. Load màu của vehicle model
  const fetchVehicleColors = async (modelId) => {
    try {
      const res = await apiClient.get(`/api/vehicle-models/${modelId}/colors`);
      if (res.data.success) {
        // Chỉ lấy các màu active
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

  //  3. Mở modal thêm vào giỏ hàng
  const openAddToCartModal = async (vehicle) => {
    setSelectedVehicle(vehicle);
    await fetchVehicleColors(vehicle.id);
    addToCartForm.resetFields();
    addToCartForm.setFieldsValue({
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
        message.success(res.data.message || "Đã thêm vào giỏ hàng thành công!");
        setAddToCartModalOpen(false);
        addToCartForm.resetFields();
      } else {
        message.error(res.data.message || "Không thể thêm vào giỏ hàng!");
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
      message.error(errorMsg);
    }
  };

  //  5. Filter vehicles
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesBrand = brandFilter === "All" || vehicle.brand === brandFilter;
    const matchesSearch =
      (vehicle.name?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      ) ||
      (vehicle.brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (vehicle.modelCode?.toLowerCase() || "").includes(
        searchTerm.toLowerCase()
      );
    return matchesBrand && matchesSearch;
  });

  const brands = [...new Set(vehicles.map((v) => v.brand).filter(Boolean))];

  return (
    <DealerLayout>
      <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header Section */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            🚗 Showroom Xe Điện
          </Title>
          <Text type="secondary">
            Khám phá bộ sưu tập xe điện với công nghệ tiên tiến và thiết kế
            hiện đại
          </Text>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 shadow-sm">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={10}>
              <Search
                placeholder="Tìm kiếm theo tên, thương hiệu, mã model..."
                allowClear
                size="large"
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Select
                placeholder="Lọc theo thương hiệu"
                style={{ width: "100%" }}
                size="large"
                value={brandFilter}
                onChange={setBrandFilter}
              >
                <Option value="All">Tất cả thương hiệu</Option>
                {brands.map((brand) => (
                  <Option key={brand} value={brand}>
                    {brand}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={6}>
              <Text className="text-gray-500">
                Tìm thấy <strong>{filteredVehicles.length}</strong> sản phẩm
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Vehicle Grid */}
        <Spin spinning={loading}>
          {filteredVehicles.length === 0 ? (
            <Card>
              <Empty
                description="Không tìm thấy xe nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </Card>
          ) : (
            <Row gutter={[24, 24]}>
              {filteredVehicles.map((vehicle) => (
                <Col xs={24} sm={12} lg={8} xl={6} key={vehicle.id}>
                  <Card
                    hoverable
                    className="vehicle-card h-full"
                    style={{
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                    }}
                    bodyStyle={{ padding: 0 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.15)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0,0,0,0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                    cover={
                      <div
                        style={{
                          position: "relative",
                          height: "220px",
                          overflow: "hidden",
                          backgroundColor: "#f0f0f0",
                        }}
                      >
                        <Image
                          src={vehicle.imageUrl}
                          alt={vehicle.name}
                          preview={false}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                        />
                        {vehicle.year && (
                          <Badge
                            count={vehicle.year}
                            style={{
                              position: "absolute",
                              top: "12px",
                              right: "12px",
                              backgroundColor: "rgba(255,255,255,0.9)",
                              color: "#333",
                            }}
                          />
                        )}
                      </div>
                    }
                  >
                    <div style={{ padding: "20px" }}>
                      {/* Vehicle Info */}
                      <div style={{ marginBottom: "12px" }}>
                        <Text
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontWeight: "600",
                            display: "block",
                          }}
                        >
                          {vehicle.brand}
                        </Text>
                        <Title
                          level={4}
                          style={{
                            fontSize: "18px",
                            marginBottom: "4px",
                            marginTop: "4px",
                          }}
                        >
                          {vehicle.name}
                        </Title>
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", display: "block" }}
                        >
                          {vehicle.modelCode}
                        </Text>
                      </div>

                      {/* Key Specs */}
                      <div style={{ marginBottom: "16px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <EnvironmentOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
                            <Text style={{ fontSize: "14px" }}>Quãng đường</Text>
                          </div>
                          <Text strong>{vehicle.rangeKm || "N/A"} km</Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <PoweroffOutlined style={{ color: "#52c41a", fontSize: "16px" }} />
                            <Text style={{ fontSize: "14px" }}>Pin</Text>
                          </div>
                          <Text strong>
                            {vehicle.batteryCapacity || "N/A"} kWh
                          </Text>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <ThunderboltOutlined style={{ color: "#faad14", fontSize: "16px" }} />
                            <Text style={{ fontSize: "14px" }}>Sạc</Text>
                          </div>
                          <Text strong>
                            {vehicle.chargingTime || "N/A"} phút
                          </Text>
                        </div>
                      </div>

                      {/* Price */}
                      <div
                        style={{
                          marginBottom: "16px",
                          paddingBottom: "16px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                            display: "block",
                          }}
                        >
                          Giá nhà sản xuất
                        </Text>
                        <div
                          style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                            color: "#16a34a",
                            marginTop: "4px",
                          }}
                        >
                          {vehicle.manufacturerPrice
                            ? new Intl.NumberFormat("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                                .format(vehicle.manufacturerPrice)
                                .replace("VND", "")
                                .trim() + " VNĐ"
                            : "Liên hệ"}
                        </div>
                      </div>

                      {/* Actions */}
                      <Space direction="vertical" style={{ width: "100%" }} size="small">
                        <Button
                          type="primary"
                          block
                          size="large"
                          icon={<EyeOutlined />}
                          onClick={() =>
                            navigate(`/dealer/vehicle-detail/${vehicle.id}`)
                          }
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                          }}
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          block
                          size="large"
                          icon={<ShoppingCartOutlined />}
                          onClick={() => openAddToCartModal(vehicle)}
                          style={{
                            height: "40px",
                            borderRadius: "8px",
                          }}
                        >
                          Thêm vào giỏ
                        </Button>
                      </Space>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Spin>

        {/* Footer spacing */}
        <div style={{ height: "40px" }}></div>

        {/* Modal thêm vào giỏ hàng */}
        <Modal
          open={addToCartModalOpen}
          onCancel={() => {
            setAddToCartModalOpen(false);
            addToCartForm.resetFields();
            setSelectedVehicle(null);
            setVehicleColors([]);
          }}
          title={`Thêm vào giỏ hàng - ${selectedVehicle?.name || ""}`}
          onOk={handleAddToCart}
          okText="Thêm vào giỏ"
          cancelText="Hủy"
          width={500}
          destroyOnClose
        >
          <Form form={addToCartForm} layout="vertical">
            <Form.Item
              label="Chọn màu"
              name="vehicleModelColorId"
              rules={[
                { required: true, message: "Vui lòng chọn màu!" },
              ]}
            >
              <Select placeholder="Chọn màu xe">
                {vehicleColors.map((color) => (
                  <Option key={color.id} value={color.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded border-2 border-gray-300"
                        style={{ backgroundColor: color.hexCode || "#FFFFFF" }}
                      ></div>
                      <span>{color.colorName}</span>
                      {color.priceAdjustment !== 0 && (
                        <span className="text-xs text-gray-500">
                          ({color.priceAdjustment > 0 ? "+" : ""}
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(color.priceAdjustment)})
                        </span>
                      )}
                    </div>
                  </Option>
                ))}
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
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="Nhập số lượng"
              />
            </Form.Item>

            {selectedVehicle && vehicleColors.length === 0 && (
              <div className="text-red-500 text-sm">
                Xe này chưa có màu sẵn có để thêm vào giỏ hàng.
              </div>
            )}
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}

