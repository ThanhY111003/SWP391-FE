import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Empty,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  DatePicker,
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
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function Reports() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState("all"); // all | day | month | year
  const [limit, setLimit] = useState(5);

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

  // Xử lý response từ API (có wrapper ApiResponse)
  const extractData = (response) => {
    if (!response?.data) return [];
    // API Admin Report trả về dạng ApiResponse với data là array
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Fallback: nếu không có wrapper
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    return [];
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange[0])
        params.append("fromDate", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange[1])
        params.append("toDate", dateRange[1].format("YYYY-MM-DD"));

      // Fetch Top Models
      const topModelsParams = new URLSearchParams(params);
      topModelsParams.append("limit", limit);
      const topModelsRes = await api
        .get(`reports/admin/top-models?${topModelsParams.toString()}`)
        .catch(() => ({ data: { success: true, data: [] } }));

      // Fetch Top Dealers
      const topDealersParams = new URLSearchParams(params);
      topDealersParams.append("limit", limit);
      const topDealersRes = await api
        .get(`reports/admin/top-dealers?${topDealersParams.toString()}`)
        .catch(() => ({ data: { success: true, data: [] } }));

      // Fetch Sales Trend
      const salesParams = new URLSearchParams(params);
      salesParams.append("groupBy", groupBy);
      const salesRes = await api
        .get(`reports/admin/sales-trend?${salesParams.toString()}`)
        .catch(() => ({ data: { success: true, data: [] } }));

      // Fetch Inventory Summary
      const inventoryRes = await api
        .get(`reports/admin/inventory-summary`)
        .catch(() => ({ data: { success: true, data: [] } }));

      // Fetch Dealer Performance
      const dealerPerfRes = await api
        .get(`reports/admin/dealer-performance?${params.toString()}`)
        .catch(() => ({ data: { success: true, data: [] } }));

      setTopModels(extractData(topModelsRes));
      setTopDealers(extractData(topDealersRes));

      // sales-trend trả về dạng [{ period, soldCount, totalRevenue }]
      const salesData = extractData(salesRes);
      setSalesTrend(
        Array.isArray(salesData)
          ? salesData.map((x) => ({
              period: x?.period || "N/A",
              soldCount: Number(x?.soldCount ?? 0),
              totalRevenue: Number(x?.totalRevenue ?? 0),
            }))
          : []
      );

      setInventory(extractData(inventoryRes));
      setDealerPerf(extractData(dealerPerfRes));
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
  }, [dateRange, groupBy, limit]);

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
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      width: 180,
      align: "right",
      render: (v) => formatCurrency(v),
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
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 180,
      align: "right",
      render: (v) => formatCurrency(v),
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
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      width: 160,
      align: "right",
      render: (v) => formatCurrency(v),
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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

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

    // Tính tổng doanh thu và số xe đã bán từ salesTrend
    const totalRevenue = salesTrend.reduce(
      (sum, item) => sum + (item.totalRevenue || 0),
      0
    );
    const totalSold = salesTrend.reduce(
      (sum, item) => sum + (item.soldCount || 0),
      0
    );

    return (
      <Row gutter={[12, 12]}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng số xe đã bán"
              value={totalSold}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Tổng tồn kho"
              value={totals.total}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small">
            <Statistic
              title="Sẵn sàng bán"
              value={totals.available}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  // Prepare chart data
  const salesChartData = salesTrend.map((item) => ({
    period: item.period || "N/A",
    revenue: item.totalRevenue || 0,
    sold: item.soldCount || 0,
  }));

  return (
    <div className="p-3 sm:p-6">
      {contextHolder}
      <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 12 }}>
        <Col flex="auto">
          <Typography.Title level={4} style={{ margin: 0 }}>
            Thống kê
          </Typography.Title>
          <Typography.Text type="secondary">
            Báo cáo dành cho hãng (ADMIN)
          </Typography.Text>
        </Col>
        <Col>
          <Space wrap>
            <RangePicker
              value={dateRange}
              onChange={(dates) =>
                setDateRange(dates || [dayjs().subtract(30, "days"), dayjs()])
              }
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
            <Select
              value={groupBy}
              onChange={setGroupBy}
              style={{ width: 150 }}
            >
              <Option value="all">Tất cả</Option>
              <Option value="day">Theo ngày</Option>
              <Option value="month">Theo tháng</Option>
              <Option value="year">Theo năm</Option>
            </Select>
            <Select value={limit} onChange={setLimit} style={{ width: 120 }}>
              <Option value={5}>Top 5</Option>
              <Option value={10}>Top 10</Option>
              <Option value={20}>Top 20</Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <SummaryCards />

          {/* Biểu đồ doanh thu */}
          <Row gutter={[12, 12]}>
            <Col xs={24} lg={16}>
              <Card title="Doanh thu hệ thống">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={salesChartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "revenue") return formatCurrency(value);
                          return value;
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sold"
                        stroke="#1890ff"
                        name="Số lượng bán"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#52c41a"
                        name="Doanh thu"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Không có dữ liệu
                  </div>
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Tổng hợp">
                <Space
                  direction="vertical"
                  style={{ width: "100%" }}
                  size="large"
                >
                  <Statistic
                    title="Tổng doanh thu"
                    value={salesTrend.reduce(
                      (sum, item) => sum + (item.totalRevenue || 0),
                      0
                    )}
                    formatter={(value) => formatCurrency(value)}
                    valueStyle={{ color: "#3f8600", fontSize: 20 }}
                  />
                  <Statistic
                    title="Tổng số xe đã bán"
                    value={salesTrend.reduce(
                      (sum, item) => sum + (item.soldCount || 0),
                      0
                    )}
                    valueStyle={{ color: "#1890ff", fontSize: 20 }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[12, 12]}>
            <Col xs={24} lg={12}>
              <Card title="Top mẫu xe bán chạy">
                <Table
                  size="small"
                  rowKey={(r) =>
                    `${r?.modelName ?? "model"}-${r?.colorName ?? ""}`
                  }
                  columns={modelColumns}
                  dataSource={topModels}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Top đại lý mua nhiều nhất">
                <Table
                  size="small"
                  rowKey={(r) =>
                    String(r?.dealerId ?? r?.dealerName ?? "dealer")
                  }
                  columns={dealerColumns}
                  dataSource={topDealers}
                  pagination={{ pageSize: 5 }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="Hiệu suất đại lý">
            <Row gutter={[12, 12]}>
              <Col xs={24} md={14}>
                {dealerPerf?.length ? (
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(value),
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
                  rowKey={(r) => String(r?.dealerName ?? "perf")}
                  columns={perfColumns}
                  dataSource={dealerPerf}
                  pagination={{ pageSize: 8, size: "small" }}
                />
              </Col>
            </Row>
          </Card>

          {/* Tổng hợp tồn kho */}
          <Card title="Tổng hợp tồn kho">
            <Table
              dataSource={inventory}
              rowKey={(record) => `${record.modelName}-${record.colorName}`}
              pagination={{ pageSize: 10 }}
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Model",
                  key: "model",
                  render: (_, record) => (
                    <div>
                      <div className="font-semibold">{record.modelName}</div>
                      <Tag color="purple">{record.colorName}</Tag>
                    </div>
                  ),
                },
                {
                  title: "Tổng tồn kho",
                  dataIndex: "total",
                  key: "total",
                  align: "center",
                },
                {
                  title: "Khả dụng",
                  dataIndex: "available",
                  key: "available",
                  align: "center",
                  render: (value) => <Tag color="green">{value}</Tag>,
                },
                {
                  title: "Đã đặt",
                  dataIndex: "reserved",
                  key: "reserved",
                  align: "center",
                  render: (value) => <Tag color="orange">{value}</Tag>,
                },
              ]}
            />
          </Card>
        </Space>
      </Spin>
    </div>
  );
}
