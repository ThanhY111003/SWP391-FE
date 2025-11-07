import React, { useEffect, useMemo, useState } from "react";
import { Card, Table, Space, Select, Input, Tag, Typography } from "antd";
import api from "../../config/axios";

const { Title } = Typography;

export default function VehicleInstances() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [dealerIdFilter, setDealerIdFilter] = useState();
  const [search, setSearch] = useState("");
  const [dealers, setDealers] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(false);

  const fetchData = async (dealerId) => {
    setLoading(true);
    try {
      const res = await api.get("vehicle-instances", {
        params: dealerId ? { dealerId } : undefined,
      });
      const payload = res?.data;
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setList(data);
    } catch (e) {
      console.error("Fetch vehicle-instances failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dealerIdFilter);
  }, [dealerIdFilter]);

  // Fetch dealers for filter options
  const fetchDealers = async () => {
    setDealersLoading(true);
    try {
      const res = await api.get("dealers");
      const payload = res?.data;
      let data = [];
      if (Array.isArray(payload)) data = payload;
      else if (Array.isArray(payload?.data)) data = payload.data;
      else if (Array.isArray(payload?.content)) data = payload.content;
      setDealers(data);
    } catch (e) {
      console.error("Fetch dealers failed", e);
      setDealers([]);
    } finally {
      setDealersLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const dealerOptions = useMemo(() => {
    return (dealers || []).map((d) => ({
      label: d?.name || `Đại lý #${d?.id}`,
      value: d?.id,
    }));
  }, [dealers]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (list || []).filter((x) => {
      if (dealerIdFilter) {
        // Ưu tiên lọc theo dealerId nếu backend có trả; fallback so sánh theo tên
        if (x.dealerId != null) {
          if (String(x.dealerId) !== String(dealerIdFilter)) return false;
        } else {
          const selected = dealers.find(
            (d) => String(d.id) === String(dealerIdFilter)
          );
          const selectedName = selected?.name;
          if (selectedName && x.dealerName !== selectedName) return false;
        }
      }
      if (!q) return true;
      const hay = [
        x.vin,
        x.modelName,
        x.colorName,
        x.dealerName,
        x.engineNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [list, dealers, dealerIdFilter, search]);

  const columns = [
    {
      title: "STT",
      key: "idx",
      width: 70,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Model", dataIndex: "modelName", key: "modelName" },
    { title: "Màu", dataIndex: "colorName", key: "colorName" },
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const label = v || "-";
        const color =
          v === "IN_STOCK"
            ? "blue"
            : v === "RESERVED"
            ? "gold"
            : v === "SOLD"
            ? "green"
            : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      render: (v) => (
        <Tag color={v ? "green" : "default"}>
          {v ? "Đang hoạt động" : "Ngừng"}
        </Tag>
      ),
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufacturingDate",
      key: "manufacturingDate",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
  ];

  return (
    <Card
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh sách xe vật lý
          </Title>
        </Space>
      }
    >
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo đại lý"
          style={{ width: 220 }}
          options={dealerOptions}
          value={dealerIdFilter}
          onChange={setDealerIdFilter}
          loading={dealersLoading}
        />
        <Input.Search
          allowClear
          placeholder="Tìm theo VIN / model / màu / đại lý / số máy"
          style={{ width: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={(r) => r.id ?? r.vin}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
    </Card>
  );
}
