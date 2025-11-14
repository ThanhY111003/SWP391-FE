import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Descriptions,
  Empty,
  Flex,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../config/axios";

// Lightweight sparkline using SVG, no extra deps
function Sparkline({ data = [], width = 320, height = 80, color = "#1677ff" }) {
  const path = useMemo(() => {
    if (!data?.length || data.length < 2) return "";
    const xs = data.map((_, i) => (i / (data.length - 1)) * (width - 8) + 4);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const ys = data.map((v) => height - 4 - ((v - min) / range) * (height - 8));
    return xs.map((x, i) => `${i ? "L" : "M"}${x},${ys[i]}`).join(" ");
  }, [data, width, height]);
  if (!data?.length || data.length < 2)
    return (
      <div
        style={{ height, display: "flex", alignItems: "center", color: "#999" }}
      >
        Không đủ dữ liệu
      </div>
    );
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={path.replace(/[ML]/g, "")}
      />
    </svg>
  );
}

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [range, setRange] = useState("30d"); // 7d | 30d | 90d

  const [topModels, setTopModels] = useState([]);
  const [topDealers, setTopDealers] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]); // array of {period, soldCount, totalRevenue}
  const [inventory, setInventory] = useState([]); // list of {modelName,colorName,total,available,reserved}
  const [dealerPerf, setDealerPerf] = useState([]);
  const pieColors = [
    "#1677ff",
    "#52c41a",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
  ];

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      // optionally append ?range= to endpoints if BE supports
      const q = range ? `?range=${encodeURIComponent(range)}` : "";
      const [m, d, s, i, p] = await Promise.all([
        api.get(`reports/admin/top-models${q}`).catch(() => ({ data: [] })),
        api.get(`reports/admin/top-dealers${q}`).catch(() => ({ data: [] })),
        api.get(`reports/admin/sales-trend${q}`).catch(() => ({ data: [] })),
        api
          .get(`reports/admin/inventory-summary${q}`)
          .catch(() => ({ data: {} })),
        api
          .get(`reports/admin/dealer-performance${q}`)
          .catch(() => ({ data: [] })),
      ]);
      setTopModels(normalizeList(m?.data));
      setTopDealers(normalizeList(d?.data));
      // sales-trend trả về dạng [{ period, soldCount, totalRevenue }]
      const salesPayload = normalizeList(s?.data);
      setSalesTrend(
        Array.isArray(salesPayload)
          ? salesPayload.map((x) => ({
              period: x?.period || "ALL_TIME",
              soldCount: Number(x?.soldCount ?? 0),
              totalRevenue: Number(x?.totalRevenue ?? 0),
            }))
          : []
      );
      setInventory(normalizeList(i?.data));
      setDealerPerf(normalizeList(p?.data));
    } catch (err) {
      console.error("Fetch reports failed", err);
      messageApi.error(
        err?.response?.data?.message || "Không tải được thống kê"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const modelColumns = [
    {
      title: "#",
      key: "idx",
      width: 60,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "Model", dataIndex: "modelName", key: "modelName" },
    { title: "Màu", dataIndex: "colorName", key: "colorName" },
    {
      title: "Đã bán",
      dataIndex: "soldCount",
      key: "soldCount",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Doanh thu (VND)",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 180,
      align: "right",
      render: (v) => (v != null ? Number(v).toLocaleString() : 0),
    },
  ];

  // Top đại lý mua nhiều nhất từ /reports/admin/top-dealers
  // API: { dealerId, dealerName, totalOrders, totalVehicles, totalAmount }
  const dealerColumns = [
    {
      title: "#",
      key: "idx",
      width: 60,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Số đơn hàng",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Số xe",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Tổng tiền (VND)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 180,
      align: "right",
      render: (v) => (v != null ? Number(v).toLocaleString() : 0),
    },
  ];

  // Hiệu suất đại lý từ /reports/admin/dealer-performance
  // API: { dealerName, totalOrders, completedOrders, cancelledOrders, revenue, successRate }
  const perfColumns = [
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Tổng đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Hoàn thành",
      dataIndex: "completedOrders",
      key: "completedOrders",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Hủy",
      dataIndex: "cancelledOrders",
      key: "cancelledOrders",
      width: 110,
      align: "right",
      render: (v) => Number(v ?? 0).toLocaleString(),
    },
    {
      title: "Doanh thu (VND)",
      dataIndex: "revenue",
      key: "revenue",
      width: 160,
      align: "right",
      render: (v) => (v != null ? Number(v).toLocaleString() : 0),
    },
    {
      title: "Tỷ lệ thành công",
      dataIndex: "successRate",
      key: "successRate",
      width: 150,
      align: "right",
      // Backend đã trả phần trăm (ví dụ 67.666667) nên chỉ cần làm tròn 2 số
      render: (v) => `${Number(v ?? 0).toFixed(2)}%`,
    },
  ];

  const SummaryCards = () => {
    const totals = (inventory || []).reduce(
      (acc, it) => {
        acc.total += Number(it.total ?? 0);
        acc.available += Number(it.available ?? 0);
        acc.reserved += Number(it.reserved ?? 0);
        return acc;
      },
      { total: 0, available: 0, reserved: 0 }
    );
    return (
      <Row gutter={[12, 12]}>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Tổng tồn kho" value={totals.total} />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic
              title="Sẵn sàng bán (available)"
              value={totals.available}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card size="small">
            <Statistic title="Đang giữ chỗ" value={totals.reserved} />
          </Card>
        </Col>
      </Row>
    );
  };

  return (
    <div>
      {contextHolder}
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
        <Col flex="auto">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Thống kê
          </Typography.Title>
          <Typography.Text type="secondary">
            Báo cáo dành cho hãng
          </Typography.Text>
        </Col>
        <Col>
          <Select
            value={range}
            onChange={setRange}
            style={{ width: 160 }}
            options={[
              { label: "7 ngày", value: "7d" },
              { label: "30 ngày", value: "30d" },
              { label: "90 ngày", value: "90d" },
            ]}
          />
        </Col>
      </Row>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
          <Spin />
        </div>
      ) : (
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <SummaryCards />

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12} lg={12}>
              <Card
                style={{
                  borderColor: "#faad14",
                  background:
                    "linear-gradient(135deg, rgba(250,173,20,0.12), rgba(250,173,20,0.02))",
                }}
                headStyle={{
                  fontWeight: 700,
                  color: "#d48806",
                  fontSize: 16,
                }}
                bodyStyle={{ padding: "16px 20px" }}
                title="TỔNG DOANH THU HỆ THỐNG"
              >
                {salesTrend?.length ? (
                  <Statistic
                    value={salesTrend[0].totalRevenue}
                    suffix="VND"
                    valueRender={() => (
                      <span
                        style={{
                          fontSize: 28,
                          fontWeight: 700,
                          color: "#cf1322",
                        }}
                      >
                        {Number(salesTrend[0].totalRevenue).toLocaleString()}{" "}
                        VND
                      </span>
                    )}
                  />
                ) : (
                  <Empty description="Không có dữ liệu" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={6} lg={6}>
              <Card size="small" title="Tổng số xe đã bán">
                {salesTrend?.length ? (
                  <Statistic
                    value={salesTrend[0].soldCount}
                    valueRender={() => (
                      <span style={{ fontSize: 20, fontWeight: 600 }}>
                        {Number(salesTrend[0].soldCount).toLocaleString()}
                      </span>
                    )}
                  />
                ) : (
                  <Empty description="Không có dữ liệu" />
                )}
              </Card>
            </Col>
            <Col xs={24} md={6} lg={6}>
              <Card size="small" title="Kỳ thống kê">
                {salesTrend?.length ? (
                  <Descriptions column={1} size="small" bordered>
                    <Descriptions.Item label="Kỳ">
                      {salesTrend[0].period || "ALL_TIME"}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Empty description="Không có dữ liệu" />
                )}
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Top mẫu xe bán chạy">
                <Table
                  size="small"
                  rowKey={(r) =>
                    String(
                      r?.id ??
                        r?.modelId ??
                        `${r?.modelName ?? "model"}-${r?.colorName ?? ""}`
                    )
                  }
                  columns={modelColumns}
                  dataSource={topModels}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card size="small" title="Top đại lý mua nhiều nhất">
                <Table
                  size="small"
                  rowKey={(r) =>
                    String(
                      r?.id ??
                        r?.dealerId ??
                        `${r?.dealerName ?? "dealer"}-$${r?.totalOrders ?? ""}`
                    )
                  }
                  columns={dealerColumns}
                  dataSource={topDealers}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
          </Row>

          <Card size="small" title="Hiệu suất đại lý">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={14}>
                {dealerPerf?.length ? (
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value) => [
                            Number(value).toLocaleString(),
                            "Doanh thu",
                          ]}
                        />
                        <Pie
                          data={dealerPerf}
                          dataKey="revenue"
                          nameKey="dealerName"
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          label={(entry) => `${entry.dealerName}`}
                        >
                          {dealerPerf.map((_, index) => (
                            <Cell
                              key={index}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <Empty description="Không có dữ liệu" />
                )}
              </Col>
              <Col xs={24} md={10}>
                <Table
                  size="small"
                  rowKey={(r) =>
                    String(
                      r?.id ??
                        r?.dealerId ??
                        `${r?.dealerName ?? "p"}-${r?.totalOrders ?? ""}`
                    )
                  }
                  columns={perfColumns}
                  dataSource={dealerPerf}
                  pagination={{ pageSize: 8, size: "small" }}
                />
              </Col>
            </Row>
          </Card>
        </Space>
      )}
    </div>
  );
}
