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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  DollarOutlined,
  ShoppingCartOutlined,
  CarOutlined,
  TeamOutlined,
  TrophyOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";
import dayjs from "dayjs";
import DealerLayout from "../components/dealerlayout";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

export default function DealerDashboard() {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [groupBy, setGroupBy] = useState("all"); // all | day | month | year
  const [limit, setLimit] = useState(5);

  const [topModels, setTopModels] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [inventory, setInventory] = useState([]);

  const pieColors = [
    "#1677ff",
    "#52c41a",
    "#faad14",
    "#ff4d4f",
    "#722ed1",
    "#13c2c2",
  ];

  // Xử lý response từ API
  const extractData = (response) => {
    if (!response?.data) return [];
    // API có thể trả về dạng array trực tiếp hoặc có wrapper
    if (Array.isArray(response.data)) return response.data;
    if (response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }
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
        .get(`reports/dealer/top-models?${topModelsParams.toString()}`)
        .catch(() => ({ data: [] }));

      // Fetch Top Customers
      const topCustomersParams = new URLSearchParams(params);
      topCustomersParams.append("limit", limit);
      const topCustomersRes = await api
        .get(`reports/dealer/top-customers?${topCustomersParams.toString()}`)
        .catch(() => ({ data: [] }));

      // Fetch Sales Trend
      const salesParams = new URLSearchParams(params);
      salesParams.append("groupBy", groupBy);
      const salesRes = await api
        .get(`reports/dealer/sales-trend?${salesParams.toString()}`)
        .catch(() => ({ data: [] }));

      // Fetch Inventory Status
      const inventoryRes = await api
        .get(`reports/dealer/inventory-status`)
        .catch(() => ({ data: [] }));

      setTopModels(extractData(topModelsRes));
      setTopCustomers(extractData(topCustomersRes));
      setSalesTrend(extractData(salesRes));
      setInventory(extractData(inventoryRes));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      messageApi.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [dateRange, groupBy, limit]);

  // Tính toán tổng doanh thu và số lượng bán
  const totalRevenue = salesTrend.reduce(
    (sum, item) => sum + (item.totalRevenue || 0),
    0
  );
  const totalSold = salesTrend.reduce(
    (sum, item) => sum + (item.soldCount || 0),
    0
  );
  const avgOrderValue =
    totalSold > 0 ? totalRevenue / totalSold : 0;

  // Tính tổng tồn kho
  const totalStock = inventory.reduce(
    (sum, item) => sum + (item.totalStock || 0),
    0
  );
  const totalAvailable = inventory.reduce(
    (sum, item) => sum + (item.available || 0),
    0
  );

  // Bảng Top Models
  const topModelsColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
    },
    {
      title: "Màu",
      dataIndex: "colorName",
      key: "colorName",
      render: (color) => <Tag color="blue">{color}</Tag>,
    },
    {
      title: "Số lượng bán",
      dataIndex: "soldCount",
      key: "soldCount",
      align: "center",
      render: (count) => count?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (revenue) =>
        revenue
          ? `${revenue.toLocaleString("vi-VN")} VNĐ`
          : "0 VNĐ",
    },
  ];

  // Bảng Top Customers
  const topCustomersColumns = [
    {
      title: "STT",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "customerName",
      key: "customerName",
    },
    {
      title: "Số xe đã mua",
      dataIndex: "totalVehicles",
      key: "totalVehicles",
      align: "center",
      render: (count) => count?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Tổng chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      render: (spent) =>
        spent ? `${spent.toLocaleString("vi-VN")} VNĐ` : "0 VNĐ",
    },
    {
      title: "Lần mua cuối",
      dataIndex: "lastPurchase",
      key: "lastPurchase",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
  ];

  // Bảng Inventory
  const inventoryColumns = [
    {
      title: "Mẫu xe",
      dataIndex: "modelName",
      key: "modelName",
    },
    {
      title: "Màu",
      dataIndex: "colorName",
      key: "colorName",
      render: (color) => <Tag color="green">{color}</Tag>,
    },
    {
      title: "Tổng tồn kho",
      dataIndex: "totalStock",
      key: "totalStock",
      align: "center",
      render: (stock) => stock?.toLocaleString("vi-VN") || 0,
    },
    {
      title: "Có sẵn",
      dataIndex: "available",
      key: "available",
      align: "center",
      render: (available) => (
        <Tag color="success">{available?.toLocaleString("vi-VN") || 0}</Tag>
      ),
    },
    {
      title: "Đã đặt",
      dataIndex: "reserved",
      key: "reserved",
      align: "center",
      render: (reserved) => (
        <Tag color="warning">{reserved?.toLocaleString("vi-VN") || 0}</Tag>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "soldCount",
      key: "soldCount",
      align: "center",
      render: (sold) => sold?.toLocaleString("vi-VN") || 0,
    },
  ];

  return (
    <DealerLayout>
      {contextHolder}
      <div style={{ padding: "24px" }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          {/* Header */}
          <div>
            <Title level={2}>
              <BarChartOutlined /> Dashboard
            </Title>
            <Typography.Text type="secondary">
              Tổng quan hoạt động kinh doanh của đại lý
            </Typography.Text>
          </div>

          {/* Filters */}
          <Card>
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Typography.Text strong>Khoảng thời gian:</Typography.Text>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                  />
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Typography.Text strong>Nhóm theo:</Typography.Text>
                  <Select
                    value={groupBy}
                    onChange={setGroupBy}
                    style={{ width: "100%" }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="day">Theo ngày</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="year">Theo năm</Option>
                  </Select>
                </Space>
              </Col>
              <Col span={8}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Typography.Text strong>Số lượng hiển thị:</Typography.Text>
                  <Select
                    value={limit}
                    onChange={setLimit}
                    style={{ width: "100%" }}
                  >
                    <Option value={5}>Top 5</Option>
                    <Option value={10}>Top 10</Option>
                    <Option value={20}>Top 20</Option>
                  </Select>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Summary Statistics */}
          <Row gutter={16}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng doanh thu"
                  value={totalRevenue}
                  precision={0}
                  prefix={<DollarOutlined />}
                  suffix="VNĐ"
                  valueStyle={{ color: "#3f8600" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng số xe đã bán"
                  value={totalSold}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Giá trị đơn hàng trung bình"
                  value={avgOrderValue}
                  precision={0}
                  prefix={<ShoppingCartOutlined />}
                  suffix="VNĐ"
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng tồn kho"
                  value={totalStock}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: "#fa8c16" }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Có sẵn: {totalAvailable.toLocaleString("vi-VN")}
                </Typography.Text>
              </Card>
            </Col>
          </Row>

          {/* Charts and Tables */}
          <Row gutter={16}>
            {/* Sales Trend Chart */}
            <Col span={16}>
              <Card
                title="Xu hướng doanh thu"
                extra={
                  <Select
                    value={groupBy}
                    onChange={setGroupBy}
                    size="small"
                    style={{ width: 120 }}
                  >
                    <Option value="all">Tất cả</Option>
                    <Option value="day">Theo ngày</Option>
                    <Option value="month">Theo tháng</Option>
                    <Option value="year">Theo năm</Option>
                  </Select>
                }
              >
                <Spin spinning={loading}>
                  {salesTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip
                          formatter={(value, name) => {
                            if (name === "totalRevenue") {
                              return [
                                `${value.toLocaleString("vi-VN")} VNĐ`,
                                "Doanh thu",
                              ];
                            }
                            return [value, "Số lượng bán"];
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="totalRevenue"
                          stroke="#1677ff"
                          strokeWidth={2}
                          name="Doanh thu"
                        />
                        <Line
                          type="monotone"
                          dataKey="soldCount"
                          stroke="#52c41a"
                          strokeWidth={2}
                          name="Số lượng bán"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="Không có dữ liệu" />
                  )}
                </Spin>
              </Card>
            </Col>

            {/* Top Models Pie Chart */}
            <Col span={8}>
              <Card title="Top mẫu xe bán chạy">
                <Spin spinning={loading}>
                  {topModels.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={topModels}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ modelName, percent }) =>
                            `${modelName} ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="soldCount"
                        >
                          {topModels.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={pieColors[index % pieColors.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name, props) => {
                            return [
                              `${value} xe`,
                              "Số lượng bán"
                            ];
                          }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              const data = payload[0].payload;
                              return (
                                <div>
                                  <div><strong>modelName:</strong> {data.modelName || "N/A"}</div>
                                  <div><strong>colorName:</strong> {data.colorName || "N/A"}</div>
                                </div>
                              );
                            }
                            return label;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Empty description="Không có dữ liệu" />
                  )}
                </Spin>
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            {/* Top Models Table */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <TrophyOutlined />
                    Top mẫu xe bán chạy
                  </Space>
                }
              >
                <Spin spinning={loading}>
                  {topModels.length > 0 ? (
                    <Table
                      dataSource={topModels}
                      columns={topModelsColumns}
                      rowKey={(record, index) =>
                        `${record.modelName}-${record.colorName}-${index}`
                      }
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty description="Không có dữ liệu" />
                  )}
                </Spin>
              </Card>
            </Col>

            {/* Top Customers Table */}
            <Col span={12}>
              <Card
                title={
                  <Space>
                    <TeamOutlined />
                    Top khách hàng
                  </Space>
                }
              >
                <Spin spinning={loading}>
                  {topCustomers.length > 0 ? (
                    <Table
                      dataSource={topCustomers}
                      columns={topCustomersColumns}
                      rowKey="customerId"
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty description="Không có dữ liệu" />
                  )}
                </Spin>
              </Card>
            </Col>
          </Row>

          {/* Inventory Status Table */}
          <Card title="Tổng hợp tồn kho">
            <Spin spinning={loading}>
              {inventory.length > 0 ? (
                <Table
                  dataSource={inventory}
                  columns={inventoryColumns}
                  rowKey={(record, index) =>
                    `${record.modelName}-${record.colorName}-${index}`
                  }
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 800 }}
                />
              ) : (
                <Empty description="Không có dữ liệu" />
              )}
            </Spin>
          </Card>
        </Space>
      </div>
    </DealerLayout>
  );
}

