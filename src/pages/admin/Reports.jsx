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
  const [salesTrend, setSalesTrend] = useState([]); // array of numbers
  const [inventory, setInventory] = useState(null); // summary object
  const [dealerPerf, setDealerPerf] = useState([]);

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  };

  const normalizeObj = (payload) => payload?.data ?? payload ?? null;

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
      // sales-trend có thể trả về: [number] hoặc [{date,label,value}]
      const salesPayload = normalizeList(s?.data);
      setSalesTrend(
        Array.isArray(salesPayload)
          ? salesPayload.map((x, i) =>
              typeof x === "number"
                ? { label: `${i + 1}`, value: x }
                : {
                    label: x?.label || x?.date || `${i + 1}`,
                    value: Number(x?.value ?? 0),
                  }
            )
          : []
      );
      setInventory(normalizeObj(i?.data));
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
    { title: "Model", dataIndex: "name", key: "name" },
    {
      title: "Đã bán",
      dataIndex: "sold",
      key: "sold",
      width: 100,
      align: "right",
    },
  ];

  const dealerColumns = [
    {
      title: "#",
      key: "idx",
      width: 60,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "Đại lý", dataIndex: "name", key: "name" },
    {
      title: "Đơn hàng",
      dataIndex: "orders",
      key: "orders",
      width: 100,
      align: "right",
    },
    {
      title: "Doanh số (VND)",
      dataIndex: "revenue",
      key: "revenue",
      width: 160,
      align: "right",
      render: (v) => (v ? Number(v).toLocaleString() : 0),
    },
  ];

  const perfColumns = [
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Tỷ lệ hoàn thành",
      dataIndex: "fulfillmentRate",
      key: "fulfillmentRate",
      width: 160,
      align: "right",
      render: (v) => `${Math.round((Number(v) || 0) * 100)}%`,
    },
    {
      title: "Thời gian xử lý (ngày)",
      dataIndex: "avgProcessingDays",
      key: "avgProcessingDays",
      width: 200,
      align: "right",
    },
    {
      title: "Khiếu nại",
      dataIndex: "complaints",
      key: "complaints",
      width: 120,
      align: "right",
    },
  ];

  const SummaryCards = () => (
    <Row gutter={[12, 12]}>
      <Col xs={24} md={6}>
        <Card size="small">
          <Statistic
            title="Tồn kho tổng"
            value={inventory?.totalInStock ?? 0}
          />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card size="small">
          <Statistic title="Tồn kho thấp" value={inventory?.lowStock ?? 0} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card size="small">
          <Statistic title="Đang giữ chỗ" value={inventory?.reserved ?? 0} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card size="small">
          <Statistic
            title="Đang vận chuyển"
            value={inventory?.inTransit ?? 0}
          />
        </Card>
      </Col>
    </Row>
  );

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

          <Card size="small" title="Doanh thu theo thời gian">
            {salesTrend?.length ? (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesTrend}
                    margin={{ top: 10, right: 16, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => Number(v).toLocaleString()} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#1677ff"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Không có dữ liệu" />
            )}
          </Card>

          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" title="Top mẫu xe bán chạy">
                <Table
                  size="small"
                  rowKey={(r) =>
                    String(
                      r?.id ??
                        r?.modelId ??
                        r?.name ??
                        `m-${r?.name ?? ""}-${r?.sold ?? ""}`
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
                        r?.name ??
                        `d-${r?.name ?? ""}-${r?.orders ?? ""}`
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
            <Table
              size="small"
              rowKey={(r) =>
                String(
                  r?.id ??
                    r?.dealerId ??
                    `${r?.dealerName ?? "p"}-${r?.avgProcessingDays ?? ""}`
                )
              }
              columns={perfColumns}
              dataSource={dealerPerf}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Space>
      )}
    </div>
  );
}
