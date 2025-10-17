// src/pages/dealer/vehicleCatalog.jsx
import { useEffect, useState } from "react";
import { 
  Card, 
  Table, 
  Tag, 
  Select, 
  Input, 
  Row, 
  Col, 
  Image, 
  Descriptions, 
  Badge,
  Spin,
  Button,
  Modal,
  Form,
  InputNumber,
  Space,
  Popconfirm
} from "antd";
import { 
  SearchOutlined, 
  CarOutlined, 
  DollarOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LinkOutlined
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";
import toast from "react-hot-toast";

const { Search } = Input;
const { Option } = Select;

export default function VehicleCatalog() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleColors, setVehicleColors] = useState([]);
  const [allColors, setAllColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [brandFilter, setBrandFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states for vehicle assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm] = Form.useForm();
  
  // Modal states for vehicle CRUD
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm] = Form.useForm();

  // Fetch vehicle models
  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get("/api/vehicle-models");
      if (response.data.success) {
        setVehicles(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      // Mock data for development
      setVehicles([
        {
          id: 1,
          name: "VF 8",
          modelCode: "VF8-2024",
          description: "VinFast VF 8 - Premium electric SUV",
          brand: "VinFast",
          year: 2024,
          batteryCapacity: 87,
          rangeKm: 447,
          chargingTime: 70,
          maxSpeed: 180,
          acceleration: 5.5,
          seatingCapacity: 5,
          cargoVolume: 376,
          manufacturerPrice: 800000000,
          imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400",
          isActive: true
        },
        {
          id: 2,
          name: "VF 9",
          modelCode: "VF9-2024",
          description: "VinFast VF 9 - Luxury electric SUV",
          brand: "VinFast",
          year: 2024,
          batteryCapacity: 92,
          rangeKm: 510,
          chargingTime: 75,
          maxSpeed: 200,
          acceleration: 5.0,
          seatingCapacity: 7,
          cargoVolume: 450,
          manufacturerPrice: 1200000000,
          imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400",
          isActive: true
        },
        {
          id: 3,
          name: "Tesla Model 3",
          modelCode: "TM3-2024",
          description: "Tesla Model 3 - Electric sedan",
          brand: "Tesla",
          year: 2024,
          batteryCapacity: 75,
          rangeKm: 500,
          chargingTime: 60,
          maxSpeed: 225,
          acceleration: 4.4,
          seatingCapacity: 5,
          cargoVolume: 425,
          manufacturerPrice: 1800000000,
          imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400",
          isActive: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchAllColors();
  }, []);

  // Fetch all available colors
  const fetchAllColors = async () => {
    try {
      const response = await apiClient.get("/api/colors");
      if (response.data.success) {
        setAllColors(response.data.data.filter(color => color.isActive));
      }
    } catch (error) {
      console.error("Error fetching all colors:", error);
      // Mock data for development
      setAllColors([
        {
          id: 1,
          colorName: "Pearl White",
          hexCode: "#FFFFFF",
          isActive: true
        },
        {
          id: 2,
          colorName: "Midnight Silver",
          hexCode: "#2C2C2C",
          isActive: true
        },
        {
          id: 3,
          colorName: "Deep Blue",
          hexCode: "#1E3A8A",
          isActive: true
        }
      ]);
    }
  };

  // Fetch vehicle colors when a vehicle is selected
  const fetchVehicleColors = async () => {
    if (!selectedVehicle) return;
    
    try {
      const response = await apiClient.get(`/api/vehicle-models/${selectedVehicle.id}/colors`);
      if (response.data.success) {
        setVehicleColors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle colors:", error);
      // Mock data for development
      setVehicleColors([
        {
          id: 1,
          colorName: "Pearl White",
          hexCode: "#FFFFFF",
          priceAdjustment: 0,
          isActive: true
        },
        {
          id: 2,
          colorName: "Midnight Silver",
          hexCode: "#2C2C2C",
          priceAdjustment: 5000000,
          isActive: true
        }
      ]);
    }
  };

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleColors();
    }
  }, [selectedVehicle]);

  // CRUD Functions for Vehicles
  const openVehicleModal = async (vehicle = null) => {
    setEditingVehicle(vehicle);
    if (vehicle) {
      // Fetch detailed vehicle data when editing
      try {
        const response = await apiClient.get(`/api/vehicle-models/${vehicle.id}`);
        if (response.data.success) {
          const vehicleData = response.data.data;
          vehicleForm.setFieldsValue({
            name: vehicleData.name,
            modelCode: vehicleData.modelCode,
            description: vehicleData.description || '',
            brand: vehicleData.brand,
            year: vehicleData.year,
            batteryCapacity: vehicleData.batteryCapacity,
            rangeKm: vehicleData.rangeKm,
            chargingTime: vehicleData.chargingTime,
            maxSpeed: vehicleData.maxSpeed,
            acceleration: vehicleData.acceleration,
            seatingCapacity: vehicleData.seatingCapacity,
            cargoVolume: vehicleData.cargoVolume,
            manufacturerPrice: vehicleData.manufacturerPrice,
            imageUrl: vehicleData.imageUrl || '',
            isActive: vehicleData.isActive
          });
        }
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
        toast.error("Failed to load vehicle details!", {
          position: "top-right",
          duration: 3000,
        });
        // Fallback to basic vehicle data
        vehicleForm.setFieldsValue(vehicle);
      }
    } else {
      vehicleForm.resetFields();
    }
    setIsVehicleModalOpen(true);
  };

  const handleVehicleSubmit = async () => {
    try {
      const values = await vehicleForm.validateFields();
      
      if (editingVehicle) {
        // Update vehicle
        const response = await apiClient.put(`/api/vehicle-models/${editingVehicle.id}`, values);
        if (response.data.success) {
          toast.success("Vehicle updated successfully!", {
            position: "top-right",
            duration: 3000,
          });
          fetchVehicles();
        } else {
          toast.error(response.data.message || "Failed to update vehicle!", {
            position: "top-right",
            duration: 3000,
          });
        }
      } else {
        // Create vehicle
        const response = await apiClient.post("/api/vehicle-models/create", values);
        if (response.data.success) {
          toast.success("Vehicle created successfully!", {
            position: "top-right",
            duration: 3000,
          });
          fetchVehicles();
        } else {
          toast.error(response.data.message || "Failed to create vehicle!", {
            position: "top-right",
            duration: 3000,
          });
        }
      }
      setIsVehicleModalOpen(false);
    } catch (error) {
      console.error("Error saving vehicle:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to save vehicle!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  const handleVehicleDelete = async (id) => {
    try {
      const response = await apiClient.delete(`/api/vehicle-models/${id}`);
      if (response.data.success) {
        toast.success("Vehicle deleted successfully!", {
          position: "top-right",
          duration: 3000,
        });
        fetchVehicles();
      } else {
        toast.error(response.data.message || "Failed to delete vehicle!", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to delete vehicle!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  // Assign color to vehicle
  const openAssignModal = () => {
    assignForm.resetFields();
    setIsAssignModalOpen(true);
  };

  const handleAssignColor = async () => {
    try {
      const values = await assignForm.validateFields();
      const { colorId, priceAdjustment } = values;
      
      const response = await apiClient.post(
        `/api/vehicle-models/${selectedVehicle.id}/colors/${colorId}/assign?priceAdjustment=${priceAdjustment}`
      );
      
      if (response.data.success) {
        toast.success("Color assigned to vehicle successfully!", {
          position: "top-right",
          duration: 3000,
        });
        fetchVehicleColors();
        setIsAssignModalOpen(false);
      } else {
        toast.error(response.data.message || "Failed to assign color!", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error assigning color:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to assign color!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesBrand = brandFilter === "All" || vehicle.brand === brandFilter;
    const matchesSearch = (vehicle.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (vehicle.brand?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (vehicle.modelCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const brands = [...new Set(vehicles.map(v => v.brand).filter(brand => brand))];

  const vehicleColumns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <Image
          width={80}
          height={60}
          src={url}
          alt="Vehicle"
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      ),
    },
    {
      title: "Model",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-800">{text}</div>
          <div className="text-sm text-gray-500">{record.brand}</div>
          <div className="text-xs text-gray-400">{record.modelCode}</div>
        </div>
      ),
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      render: (year) => year || 'N/A',
    },
    {
      title: "Manufacturer Price",
      dataIndex: "manufacturerPrice",
      key: "manufacturerPrice",
      render: (price) => (
        <div className="text-green-600 font-semibold">
          {price ? price.toLocaleString() : 'N/A'} VNĐ
        </div>
      ),
    },
    {
      title: "Range",
      dataIndex: "rangeKm",
      key: "rangeKm",
      render: (range) => `${range || 'N/A'} km`,
    },
    {
      title: "Battery",
      dataIndex: "batteryCapacity",
      key: "batteryCapacity",
      render: (capacity) => `${capacity || 'N/A'} kWh`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Badge status={isActive ? "success" : "error"} text={isActive ? "Active" : "Inactive"} />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button 
            type="default" 
            size="small"
            onClick={() => setSelectedVehicle(record)}
            icon={<CarOutlined />}
          >
            View Colors
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => openVehicleModal(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this vehicle?"
            description="This action cannot be undone."
            onConfirm={() => handleVehicleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const colorColumns = [
    {
      title: "Color",
      dataIndex: "colorName",
      key: "colorName",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: record.hexCode || '#FFFFFF' }}
          ></div>
          <span className="font-medium">{text || 'N/A'}</span>
        </div>
      )
    },
    {
      title: "Hex Code",
      dataIndex: "hexCode",
      key: "hexCode",
      render: (hex) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {hex || 'N/A'}
        </code>
      )
    },
    {
      title: "Price Adjustment",
      dataIndex: "priceAdjustment",
      key: "priceAdjustment",
      render: (adjustment) => (
        <span className={adjustment > 0 ? "text-green-600" : adjustment < 0 ? "text-red-600" : "text-gray-600"}>
          {adjustment > 0 ? "+" : ""}{adjustment ? adjustment.toLocaleString() : '0'} VNĐ
        </span>
      )
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Badge status={isActive ? "success" : "error"} text={isActive ? "Active" : "Inactive"} />
      ),
    }
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                🚗 Vehicle Catalog
              </h2>
              <p className="text-gray-600">View vehicle models, configurations, and pricing</p>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openVehicleModal()}
            >
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={16}>
            <Col span={8}>
              <Search
                placeholder="Search vehicles..."
                allowClear
                onSearch={setSearchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={<SearchOutlined />}
              />
            </Col>
            <Col span={8}>
              <Select
                placeholder="Filter by brand"
                style={{ width: "100%" }}
                value={brandFilter}
                onChange={setBrandFilter}
              >
                <Option value="All">All Brands</Option>
                {brands.map(brand => (
                  <Option key={brand} value={brand}>{brand}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        </Card>

        <Row gutter={24}>
          {/* Vehicle List */}
          <Col span={selectedVehicle ? 16 : 24}>
            <Card title="Available Vehicles" className="mb-6">
              <Spin spinning={loading}>
                <Table
                  dataSource={filteredVehicles}
                  columns={vehicleColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              </Spin>
            </Card>
          </Col>

          {/* Vehicle Details & Colors */}
          {selectedVehicle && (
            <Col span={8}>
              <Card 
                title={`${selectedVehicle.modelName} Details`}
                extra={
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<LinkOutlined />}
                    onClick={openAssignModal}
                  >
                    Assign Color
                  </Button>
                }
                className="mb-6"
              >
                <Image
                  width="100%"
                  height={200}
                  src={selectedVehicle.imageUrl}
                  alt={selectedVehicle.name}
                  style={{ objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
                />
                
                <Descriptions column={1} size="small">
                  <Descriptions.Item label="Brand">{selectedVehicle.brand || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Model Code">{selectedVehicle.modelCode || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Year">{selectedVehicle.year || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Manufacturer Price">
                    <span className="text-green-600 font-semibold">
                      {selectedVehicle.manufacturerPrice ? selectedVehicle.manufacturerPrice.toLocaleString() : 'N/A'} VNĐ
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Range">{selectedVehicle.rangeKm || 'N/A'} km</Descriptions.Item>
                  <Descriptions.Item label="Battery">{selectedVehicle.batteryCapacity || 'N/A'} kWh</Descriptions.Item>
                  <Descriptions.Item label="Max Speed">{selectedVehicle.maxSpeed || 'N/A'} km/h</Descriptions.Item>
                  <Descriptions.Item label="Acceleration">{selectedVehicle.acceleration || 'N/A'}s (0-100km/h)</Descriptions.Item>
                  <Descriptions.Item label="Charging Time">{selectedVehicle.chargingTime || 'N/A'} minutes</Descriptions.Item>
                  <Descriptions.Item label="Seating Capacity">{selectedVehicle.seatingCapacity || 'N/A'} seats</Descriptions.Item>
                  <Descriptions.Item label="Cargo Volume">{selectedVehicle.cargoVolume || 'N/A'} L</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="Available Colors">
                <Table
                  dataSource={vehicleColors}
                  columns={colorColumns}
                  rowKey="id"
                  pagination={false}
                  size="small"
                />
              </Card>
            </Col>
          )}
        </Row>

        {/* Vehicle Modal */}
        <Modal
          title={editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
          open={isVehicleModalOpen}
          onCancel={() => setIsVehicleModalOpen(false)}
          onOk={handleVehicleSubmit}
          okText="Save"
          cancelText="Cancel"
          width={800}
        >
          <Form
            form={vehicleForm}
            layout="vertical"
            initialValues={{
              isActive: true,
              year: new Date().getFullYear()
            }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Vehicle Name"
                  rules={[{ required: true, message: "Please enter vehicle name!" }]}
                >
                  <Input placeholder="e.g., VF 8" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="modelCode"
                  label="Model Code"
                  rules={[{ required: true, message: "Please enter model code!" }]}
                >
                  <Input placeholder="e.g., VF8-2024" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="brand"
                  label="Brand"
                  rules={[{ required: true, message: "Please enter brand!" }]}
                >
                  <Input placeholder="e.g., VinFast" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="year"
                  label="Year"
                  rules={[{ required: true, message: "Please enter year!" }]}
                >
                  <InputNumber 
                    style={{ width: "100%" }} 
                    placeholder="2024" 
                    min={1900} 
                    max={new Date().getFullYear() + 1}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="Description"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Enter vehicle description..." 
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="batteryCapacity"
                  label="Battery Capacity (kWh)"
                  rules={[{ required: true, message: "Please enter battery capacity!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="87" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="rangeKm"
                  label="Range (km)"
                  rules={[{ required: true, message: "Please enter range!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="447" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="chargingTime"
                  label="Charging Time (minutes)"
                  rules={[{ required: true, message: "Please enter charging time!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="70" min={0} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  name="maxSpeed"
                  label="Max Speed (km/h)"
                  rules={[{ required: true, message: "Please enter max speed!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="180" min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="acceleration"
                  label="Acceleration (s)"
                  rules={[{ required: true, message: "Please enter acceleration!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="5.5" step={0.1} min={0} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="seatingCapacity"
                  label="Seating Capacity"
                  rules={[{ required: true, message: "Please enter seating capacity!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="5" min={1} max={9} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="cargoVolume"
                  label="Cargo Volume (L)"
                  rules={[{ required: true, message: "Please enter cargo volume!" }]}
                >
                  <InputNumber style={{ width: "100%" }} placeholder="376" min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="manufacturerPrice"
                  label="Manufacturer Price (VNĐ)"
                  rules={[{ required: true, message: "Please enter manufacturer price!" }]}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                    placeholder="800000000"
                    min={0}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="imageUrl"
              label="Image URL"
            >
              <Input placeholder="https://example.com/image.jpg" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label="Status"
              valuePropName="checked"
            >
              <div className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span>Active</span>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* Assign Color Modal */}
        <Modal
          title="Assign Color to Vehicle"
          open={isAssignModalOpen}
          onCancel={() => setIsAssignModalOpen(false)}
          onOk={handleAssignColor}
          okText="Assign"
          cancelText="Cancel"
        >
          <Form form={assignForm} layout="vertical">
            <Form.Item
              name="colorId"
              label="Select Color"
              rules={[{ required: true, message: "Please select a color!" }]}
            >
              <Select placeholder="Choose a color">
                {allColors.map(color => (
                  <Option key={color.id} value={color.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.hexCode }}
                      ></div>
                      {color.colorName}
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="priceAdjustment"
              label="Price Adjustment (VNĐ)"
              initialValue={0}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                placeholder="0"
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}