// src/pages/dealer/Inventory.jsx
import { useEffect, useState } from "react";
import { Table, Tag, Card, Select, Input } from "antd";
import DealerLayout from "../components/dealerlayout";

const Inventory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    // Giả lập gọi API
    setTimeout(() => {
      setVehicles([
        {
          id: 1,
          model: "Model A",
          chassis: "CH001",
          engine: "EN001",
          status: "In Manufacturer’s Warehouse",
          dealer: "AutoCity Dealer",
        },
        {
          id: 2,
          model: "Model A",
          chassis: "CH002",
          engine: "EN002",
          status: "In Delivery",
          dealer: "AutoCity Dealer",
        },
        {
          id: 3,
          model: "Model B",
          chassis: "CH003",
          engine: "EN003",
          status: "Delivered to Dealer",
          dealer: "AutoWorld Dealer",
        },
        {
          id: 4,
          model: "Model C",
          chassis: "CH004",
          engine: "EN004",
          status: "Sold to Customer",
          dealer: "AutoCity Dealer",
        },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const filteredData = vehicles.filter((v) => {
    const matchStatus =
      statusFilter === "All" ? true : v.status === statusFilter;
    const matchSearch =
      search === "" ||
      v.model.toLowerCase().includes(search.toLowerCase()) ||
      v.chassis.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Thêm đoạn lọc theo role ngay sau đây
  const userDealer = localStorage.getItem("dealerName");
  const visibleVehicles =
    role === "Manufacturer"
      ? filteredData
      : filteredData.filter((v) => v.dealer === userDealer);

  const statusColors = {
    "In Manufacturer’s Warehouse": "blue",
    "In Delivery": "orange",
    "Delivered to Dealer": "green",
    "Sold to Customer": "red",
  };

  const columns = [
    {
      title: "Model",
      dataIndex: "model",
      key: "model",
    },
    {
      title: "Chassis Number",
      dataIndex: "chassis",
      key: "chassis",
    },
    {
      title: "Engine Number",
      dataIndex: "engine",
      key: "engine",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Dealer",
      dataIndex: "dealer",
      key: "dealer",
    },
  ];

  return (
    <DealerLayout>
      <Card
        title="Vehicle Inventory"
        extra={
          <div className="flex gap-3">
            <Select
              defaultValue="All"
              onChange={(v) => setStatusFilter(v)}
              options={[
                { value: "All", label: "All Status" },
                {
                  value: "In Manufacturer’s Warehouse",
                  label: "In Manufacturer’s Warehouse",
                },
                { value: "In Delivery", label: "In Delivery" },
                { value: "Delivered to Dealer", label: "Delivered to Dealer" },
                { value: "Sold to Customer", label: "Sold to Customer" },
              ]}
            />
            <Input.Search
              placeholder="Search by model or chassis..."
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: 240 }}
            />
          </div>
        }
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={visibleVehicles}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </DealerLayout>
  );
};

export default Inventory;
