// src/pages/dealer/dashboard.jsx
import { Card, Statistic, Row, Col, Skeleton, Table, Tag, Spin, DatePicker, Select, Space } from "antd";
import { useEffect, useState } from "react";
import DealerLayout from "../components/dealerlayout";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import apiClient from "../../utils/axiosConfig";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function DealerDashboard() {
  const [loading, setLoading] = useState(true);
  const [topModels, setTopModels] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [inventoryStatus, setInventoryStatus] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, "days"), dayjs()]);
  const [groupBy, setGroupBy] = useState("all");
  const [limit, setLimit] = useState(5);

  // 1. Fetch Top Models
  const fetchTopModels = async () => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit);
      if (dateRange[0]) params.append("fromDate", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange[1]) params.append("toDate", dateRange[1].format("YYYY-MM-DD"));

      const res = await apiClient.get(`/api/reports/dealer/top-models?${params.toString()}`);
      if (res.data && Array.isArray(res.data)) {
        setTopModels(res.data);
      } else if (res.data?.success && res.data.data) {
        setTopModels(res.data.data);
      } else {
        setTopModels([]);
      }
    } catch (err) {
      console.error("Error fetching top models:", err);
      setTopModels([]);
    }
  };

  // 2. Fetch Top Customers
  const fetchTopCustomers = async () => {
    try {
      const params = new URLSearchParams();
      params.append("limit", limit);
      if (dateRange[0]) params.append("fromDate", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange[1]) params.append("toDate", dateRange[1].format("YYYY-MM-DD"));

      const res = await apiClient.get(`/api/reports/dealer/top-customers?${params.toString()}`);
      if (res.data && Array.isArray(res.data)) {
        setTopCustomers(res.data);
      } else if (res.data?.success && res.data.data) {
        setTopCustomers(res.data.data);
      } else {
        setTopCustomers([]);
      }
    } catch (err) {
      console.error("Error fetching top customers:", err);
      setTopCustomers([]);
    }
  };

  // 3. Fetch Sales Trend
  const fetchSalesTrend = async () => {
    try {
      const params = new URLSearchParams();
      params.append("groupBy", groupBy);
      if (dateRange[0]) params.append("fromDate", dateRange[0].format("YYYY-MM-DD"));
      if (dateRange[1]) params.append("toDate", dateRange[1].format("YYYY-MM-DD"));

      const res = await apiClient.get(`/api/reports/dealer/sales-trend?${params.toString()}`);
      if (res.data && Array.isArray(res.data)) {
        setSalesTrend(res.data);
      } else if (res.data?.success && res.data.data) {
        setSalesTrend(res.data.data);
      } else {
        setSalesTrend([]);
      }
    } catch (err) {
      console.error("Error fetching sales trend:", err);
      setSalesTrend([]);
    }
  };

  // 4. Fetch Inventory Status
  const fetchInventoryStatus = async () => {
    try {
      const res = await apiClient.get("/api/reports/dealer/inventory-status");
      if (res.data && Array.isArray(res.data)) {
        setInventoryStatus(res.data);
      } else if (res.data?.success && res.data.data) {
        setInventoryStatus(res.data.data);
      } else {
        setInventoryStatus([]);
      }
    } catch (err) {
      console.error("Error fetching inventory status:", err);
      setInventoryStatus([]);
    }
  };

  // 5. Load all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTopModels(),
        fetchTopCustomers(),
        fetchSalesTrend(),
        fetchInventoryStatus(),
      ]);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [dateRange, groupBy, limit]);

  // 6. Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // 7. Calculate summary stats
  const totalRevenue = salesTrend.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
  const totalSold = salesTrend.reduce((sum, item) => sum + (item.soldCount || 0), 0);
  const totalInventory = inventoryStatus.reduce((sum, item) => sum + (item.totalStock || 0), 0);
  const availableInventory = inventoryStatus.reduce((sum, item) => sum + (item.available || 0), 0);

  // 8. Prepare chart data
  const salesChartData = salesTrend.map((item) => ({
    period: item.period || "N/A",
    revenue: item.totalRevenue || 0,
    sold: item.soldCount || 0,
  }));

  const topModelsChartData = topModels.map((item, index) => ({
    name: `${item.modelName} - ${item.colorName}`,
    value: item.soldCount || 0,
    revenue: item.totalRevenue || 0,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dealer Dashboard</h2>
          <Space direction="vertical" size="small" className="w-full sm:w-auto">
            <Space wrap>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates || [dayjs().subtract(30, "days"), dayjs()])}
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
              <Select
                value={limit}
                onChange={setLimit}
                style={{ width: 120 }}
              >
                <Option value={5}>Top 5</Option>
                <Option value={10}>Top 10</Option>
                <Option value={20}>Top 20</Option>
              </Select>
            </Space>
          </Space>
        </div>

        <Spin spinning={loading}>
          {/* Thống kê tổng quan */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md">
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenue}
                  precision={0}
                  formatter={(value) => formatCurrency(value)}
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md">
                <Statistic
                  title="Tổng số xe đã bán"
                  value={totalSold}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md">
                <Statistic
                  title="Tổng tồn kho"
                  value={totalInventory}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card className="shadow-md">
                <Statistic
                  title="Tồn kho khả dụng"
                  value={availableInventory}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            {/* Biểu đồ doanh thu */}
            <Col xs={24} lg={16}>
              <Card className="shadow-md" title="Doanh thu đại lý">
                {salesChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                  <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
                )}
              </Card>
            </Col>

            {/* Top Models Pie Chart */}
            <Col xs={24} lg={8}>
              <Card className="shadow-md" title="Top mẫu xe bán chạy">
                {topModelsChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topModelsChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topModelsChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500">Không có dữ liệu</div>
                )}
              </Card>
            </Col>

            {/* Top Models Table */}
            <Col xs={24} lg={12}>
              <Card className="shadow-md" title="Top mẫu xe bán chạy">
                <Table
                  dataSource={topModels}
                  rowKey={(record, index) => `${record.modelName}-${record.colorName}-${index}`}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "Model",
                      key: "model",
                      render: (_, record) => (
                        <div>
                          <div className="font-semibold">{record.modelName}</div>
                          <Tag color="blue">{record.colorName}</Tag>
                        </div>
                      ),
                    },
                    {
                      title: "Số lượng bán",
                      dataIndex: "soldCount",
                      key: "soldCount",
                      align: "center",
                    },
                    {
                      title: "Doanh thu",
                      dataIndex: "totalRevenue",
                      key: "totalRevenue",
                      render: (value) => formatCurrency(value),
                      align: "right",
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Top Customers Table */}
            <Col xs={24} lg={12}>
              <Card className="shadow-md" title="Top khách hàng mua xe nhiều nhất">
                <Table
                  dataSource={topCustomers}
                  rowKey="customerId"
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "Khách hàng",
                      dataIndex: "customerName",
                      key: "customerName",
                    },
                    {
                      title: "Số xe đã mua",
                      dataIndex: "totalVehicles",
                      key: "totalVehicles",
                      align: "center",
                    },
                    {
                      title: "Tổng chi tiêu",
                      dataIndex: "totalSpent",
                      key: "totalSpent",
                      render: (value) => formatCurrency(value),
                      align: "right",
                    },
                    {
                      title: "Lần mua cuối",
                      dataIndex: "lastPurchase",
                      key: "lastPurchase",
                      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Inventory Status Table */}
            <Col xs={24}>
              <Card className="shadow-md" title="Tổng hợp tồn kho">
                <Table
                  dataSource={inventoryStatus}
                  rowKey={(record, index) => `${record.modelName}-${record.colorName}-${index}`}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
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
                      dataIndex: "totalStock",
                      key: "totalStock",
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
                    {
                      title: "Đã bán",
                      dataIndex: "soldCount",
                      key: "soldCount",
                      align: "center",
                      render: (value) => <Tag color="blue">{value}</Tag>,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Spin>
      </div>
    </DealerLayout>
  );
}
