// src/pages/dealer/vehicleComparison.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Select,
  Button,
  Table,
  Row,
  Col,
  Image,
  Tag,
  Progress,
  Spin,
  Empty,
} from "antd";
import {
  SwapOutlined,
  CarOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;

export default function VehicleComparison() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiClient.get("/api/vehicle-models");
        if (response.data.success) {
          setVehicles(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleVehicleSelect = (vehicleId, slot) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    setSelectedVehicles((prev) => {
      const newSelection = [...prev];
      newSelection[slot] = vehicle;
      return newSelection;
    });
  };

  const handleRemoveVehicle = (slot) => {
    setSelectedVehicles((prev) => {
      const newSelection = [...prev];
      newSelection[slot] = null;
      return newSelection;
    });
  };

  const handleSwapVehicles = () => {
    if (selectedVehicles.length >= 2) {
      setSelectedVehicles((prev) => [prev[1], prev[0], prev[2]]);
    }
  };

  const getComparisonData = () => {
    const specs = [
      { key: "name", label: "Model Name", icon: <CarOutlined /> },
      { key: "brand", label: "Brand", icon: <CarOutlined /> },
      { key: "year", label: "Year", icon: <CarOutlined /> },
      {
        key: "batteryCapacity",
        label: "Battery Capacity (kWh)",
        icon: <ThunderboltOutlined />,
      },
      { key: "rangeKm", label: "Range (km)", icon: <DashboardOutlined /> },
      {
        key: "chargingTime",
        label: "Charging Time (hours)",
        icon: <ClockCircleOutlined />,
      },
      {
        key: "maxSpeed",
        label: "Max Speed (km/h)",
        icon: <DashboardOutlined />,
      },
      {
        key: "acceleration",
        label: "Acceleration (0-100km/h)",
        icon: <DashboardOutlined />,
      },
      {
        key: "seatingCapacity",
        label: "Seating Capacity",
        icon: <TeamOutlined />,
      },
      { key: "cargoVolume", label: "Cargo Volume (L)", icon: <CarOutlined /> },
      {
        key: "manufacturerPrice",
        label: "Price (VND)",
        icon: <DollarOutlined />,
      },
    ];

    return specs.map((spec) => ({
      specification: spec.label,
      icon: spec.icon,
      vehicles: selectedVehicles.map((vehicle) => {
        if (!vehicle) return null;

        let value = vehicle[spec.key];
        if (spec.key === "manufacturerPrice") {
          value = `${value.toLocaleString("vi-VN")} VND`;
        } else if (spec.key === "acceleration") {
          value = `${value} seconds`;
        } else if (spec.key === "chargingTime") {
          value = `${value} hours`;
        } else if (spec.key === "rangeKm") {
          value = `${value} km`;
        } else if (spec.key === "maxSpeed") {
          value = `${value} km/h`;
        } else if (spec.key === "batteryCapacity") {
          value = `${value} kWh`;
        } else if (spec.key === "cargoVolume") {
          value = `${value} L`;
        }

        return value;
      }),
    }));
  };

  const getBestValue = (specKey) => {
    const values = selectedVehicles.filter((v) => v).map((v) => v[specKey]);

    if (values.length === 0) return null;

    // For price, lower is better
    if (specKey === "manufacturerPrice") {
      const minValue = Math.min(...values);
      return values.indexOf(minValue);
    }

    // For other specs, higher is generally better
    const maxValue = Math.max(...values);
    return values.indexOf(maxValue);
  };

  const comparisonData = getComparisonData();

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            <SwapOutlined className="mr-2" />
            Vehicle Comparison
          </h2>
          <p className="text-gray-600">
            Compare up to 3 vehicle models side by side
          </p>
        </div>

        {/* Vehicle Selection */}
        <Card title="Select Vehicles to Compare" className="mb-6">
          <Spin spinning={loading}>
            <Row gutter={16}>
              {[0, 1, 2].map((slot) => (
                <Col span={8} key={slot}>
                  <div className="border rounded-lg p-4 h-80">
                    {selectedVehicles[slot] ? (
                      <div className="text-center">
                        <Image
                          src={selectedVehicles[slot].imageUrl}
                          alt={selectedVehicles[slot].name}
                          className="rounded-lg mb-3"
                          width="100%"
                          height={120}
                          style={{ objectFit: "cover" }}
                        />
                        <h3 className="font-semibold mb-1">
                          {selectedVehicles[slot].name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {selectedVehicles[slot].brand} -{" "}
                          {selectedVehicles[slot].year}
                        </p>
                        <p className="text-lg font-bold text-green-600 mb-3">
                          {selectedVehicles[
                            slot
                          ].manufacturerPrice.toLocaleString("vi-VN")}{" "}
                          VND
                        </p>
                        <Button
                          danger
                          size="small"
                          onClick={() => handleRemoveVehicle(slot)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CarOutlined className="text-4xl text-gray-400 mb-3" />
                        <p className="text-gray-500 mb-3">
                          Select Vehicle {slot + 1}
                        </p>
                        <Select
                          placeholder="Choose a vehicle"
                          className="w-full"
                          onChange={(value) => handleVehicleSelect(value, slot)}
                          value={null}
                        >
                          {vehicles
                            .filter(
                              (v) =>
                                !selectedVehicles.some(
                                  (sv) => sv && sv.id === v.id
                                )
                            )
                            .map((vehicle) => (
                              <Option key={vehicle.id} value={vehicle.id}>
                                {vehicle.name} - {vehicle.brand}
                              </Option>
                            ))}
                        </Select>
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>

            {selectedVehicles.filter((v) => v).length >= 2 && (
              <div className="text-center mt-4">
                <Button
                  icon={<SwapOutlined />}
                  onClick={handleSwapVehicles}
                  disabled={selectedVehicles.filter((v) => v).length < 2}
                >
                  Swap Vehicles
                </Button>
              </div>
            )}
          </Spin>
        </Card>

        {/* Comparison Table */}
        {selectedVehicles.filter((v) => v).length > 0 ? (
          <Card title="Detailed Comparison">
            <Table
              dataSource={comparisonData}
              pagination={false}
              scroll={{ x: 800 }}
              columns={[
                {
                  title: "Specification",
                  dataIndex: "specification",
                  key: "specification",
                  width: 200,
                  render: (text, record) => (
                    <div className="flex items-center gap-2">
                      {record.icon}
                      <span className="font-medium">{text}</span>
                    </div>
                  ),
                },
                ...selectedVehicles.map((vehicle, index) => ({
                  title: vehicle ? (
                    <div className="text-center">
                      <Image
                        src={vehicle.imageUrl}
                        alt={vehicle.name}
                        width={60}
                        height={40}
                        style={{ objectFit: "cover" }}
                        className="rounded mb-2"
                      />
                      <div className="font-semibold text-sm">
                        {vehicle.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {vehicle.brand}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <CarOutlined className="text-2xl mb-1" />
                      <div className="text-sm">No Vehicle</div>
                    </div>
                  ),
                  dataIndex: "vehicles",
                  key: `vehicle-${index}`,
                  width: 150,
                  align: "center",
                  render: (vehicles, record) => {
                    const value = vehicles[index];
                    const isBest =
                      getBestValue(
                        record.specification
                          .toLowerCase()
                          .replace(/[^a-z]/g, "")
                      ) === index;

                    return value ? (
                      <div
                        className={`${
                          isBest
                            ? "bg-green-50 border border-green-200 rounded p-2"
                            : ""
                        }`}
                      >
                        <span
                          className={
                            isBest ? "font-semibold text-green-700" : ""
                          }
                        >
                          {value}
                        </span>
                        {isBest && (
                          <Tag color="green" size="small" className="mt-1">
                            Best
                          </Tag>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    );
                  },
                })),
              ]}
            />
          </Card>
        ) : (
          <Card>
            <Empty
              image={<CarOutlined className="text-6xl text-gray-400" />}
              description="Select at least one vehicle to start comparison"
            />
          </Card>
        )}

        {/* Summary Cards */}
        {selectedVehicles.filter((v) => v).length > 1 && (
          <Row gutter={16} className="mt-6">
            <Col span={8}>
              <Card title="Price Range" size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {(
                      Math.max(
                        ...selectedVehicles
                          .filter((v) => v)
                          .map((v) => v.manufacturerPrice)
                      ) -
                      Math.min(
                        ...selectedVehicles
                          .filter((v) => v)
                          .map((v) => v.manufacturerPrice)
                      )
                    ).toLocaleString("vi-VN")}{" "}
                    VND
                  </div>
                  <div className="text-sm text-gray-600">Price Difference</div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Range Comparison" size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.max(
                      ...selectedVehicles.filter((v) => v).map((v) => v.rangeKm)
                    )}{" "}
                    km
                  </div>
                  <div className="text-sm text-gray-600">Best Range</div>
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Battery Capacity" size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.max(
                      ...selectedVehicles
                        .filter((v) => v)
                        .map((v) => v.batteryCapacity)
                    )}{" "}
                    kWh
                  </div>
                  <div className="text-sm text-gray-600">Largest Battery</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </DealerLayout>
  );
}
