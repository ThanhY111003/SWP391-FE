// src/pages/dealer/salesReport.jsx
import { useEffect, useState } from "react";
import { 
  Card, 
  Table, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Statistic, 
  Progress,
  Tag,
  Button,
  Spin,
  message
} from "antd";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  UserOutlined, 
  DollarOutlined, 
  ShoppingCartOutlined,
  TrophyOutlined,
  DownloadOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function SalesReport() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [selectedStaff, setSelectedStaff] = useState("All");
  const [salesData, setSalesData] = useState([]);
  const [staffPerformance, setStaffPerformance] = useState([]);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topPerformer: null
  });

  useEffect(() => {
    fetchSalesData();
  }, [dateRange, selectedStaff]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      // In a real app, you would call the API with date range and staff filter
      // const response = await axios.get(`/api/sales/report?startDate=${dateRange[0].format('YYYY-MM-DD')}&endDate=${dateRange[1].format('YYYY-MM-DD')}&staffId=${selectedStaff}`);
      
      // Mock data for development
      setTimeout(() => {
        const mockSalesData = [
          {
            id: 1,
            staffName: "Nguyễn Văn A",
            staffId: "STAFF001",
            totalOrders: 15,
            totalRevenue: 675000000,
            averageOrderValue: 45000000,
            commission: 6750000,
            rank: 1,
            performance: 95
          },
          {
            id: 2,
            staffName: "Trần Thị B",
            staffId: "STAFF002", 
            totalOrders: 12,
            totalRevenue: 540000000,
            averageOrderValue: 45000000,
            commission: 5400000,
            rank: 2,
            performance: 85
          },
          {
            id: 3,
            staffName: "Lê Văn C",
            staffId: "STAFF003",
            totalOrders: 10,
            totalRevenue: 450000000,
            averageOrderValue: 45000000,
            commission: 4500000,
            rank: 3,
            performance: 78
          },
          {
            id: 4,
            staffName: "Phạm Thị D",
            staffId: "STAFF004",
            totalOrders: 8,
            totalRevenue: 360000000,
            averageOrderValue: 45000000,
            commission: 3600000,
            rank: 4,
            performance: 65
          },
          {
            id: 5,
            staffName: "Hoàng Văn E",
            staffId: "STAFF005",
            totalOrders: 6,
            totalRevenue: 270000000,
            averageOrderValue: 45000000,
            commission: 2700000,
            rank: 5,
            performance: 55
          }
        ];

        const mockMonthlyTrend = [
          { month: "Jan", sales: 120000000, orders: 3 },
          { month: "Feb", sales: 180000000, orders: 4 },
          { month: "Mar", sales: 220000000, orders: 5 },
          { month: "Apr", sales: 280000000, orders: 6 },
          { month: "May", sales: 320000000, orders: 7 },
          { month: "Jun", sales: 380000000, orders: 8 }
        ];

        const filteredData = selectedStaff === "All" 
          ? mockSalesData 
          : mockSalesData.filter(staff => staff.staffId === selectedStaff);

        setSalesData(filteredData);
        setStaffPerformance(mockSalesData);
        setMonthlyTrend(mockMonthlyTrend);
        
        const totalSales = filteredData.reduce((sum, staff) => sum + staff.totalRevenue, 0);
        const totalOrders = filteredData.reduce((sum, staff) => sum + staff.totalOrders, 0);
        const topPerformer = mockSalesData.reduce((prev, current) => 
          prev.totalRevenue > current.totalRevenue ? prev : current
        );

        setSummaryStats({
          totalSales,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0,
          topPerformer
        });

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      message.error("Failed to load sales data");
      setLoading(false);
    }
  };

  const staffOptions = [
    { value: "All", label: "All Staff" },
    { value: "STAFF001", label: "Nguyễn Văn A" },
    { value: "STAFF002", label: "Trần Thị B" },
    { value: "STAFF003", label: "Lê Văn C" },
    { value: "STAFF004", label: "Phạm Thị D" },
    { value: "STAFF005", label: "Hoàng Văn E" }
  ];

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank) => (
        <div className="text-center">
          {rank <= 3 ? (
            <TrophyOutlined className={`text-xl ${rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-gray-400' : 'text-orange-500'}`} />
          ) : (
            <span className="text-gray-500">#{rank}</span>
          )}
        </div>
      )
    },
    {
      title: "Staff Name",
      dataIndex: "staffName",
      key: "staffName",
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{record.staffId}</div>
        </div>
      )
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center",
      render: (orders) => (
        <div className="text-center">
          <div className="text-lg font-semibold">{orders}</div>
          <div className="text-sm text-gray-500">orders</div>
        </div>
      )
    },
    {
      title: "Total Revenue",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      align: "right",
      render: (revenue) => (
        <div className="text-right">
          <div className="text-lg font-semibold text-green-600">
            {revenue.toLocaleString('vi-VN')} VND
          </div>
        </div>
      )
    },
    {
      title: "Avg Order Value",
      dataIndex: "averageOrderValue",
      key: "averageOrderValue",
      align: "right",
      render: (avg) => (
        <div className="text-right">
          <div className="font-semibold">
            {avg.toLocaleString('vi-VN')} VND
          </div>
        </div>
      )
    },
    {
      title: "Commission",
      dataIndex: "commission",
      key: "commission",
      align: "right",
      render: (commission) => (
        <div className="text-right">
          <div className="font-semibold text-blue-600">
            {commission.toLocaleString('vi-VN')} VND
          </div>
        </div>
      )
    },
    {
      title: "Performance",
      dataIndex: "performance",
      key: "performance",
      align: "center",
      render: (performance) => (
        <div className="text-center">
          <Progress
            type="circle"
            size={60}
            percent={performance}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
          <div className="text-xs text-gray-500 mt-1">{performance}%</div>
        </div>
      )
    }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const exportReport = () => {
    message.success("Report exported successfully!");
  };

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            <UserOutlined className="mr-2" />
            Sales Report by Staff
          </h2>
          <p className="text-gray-600">Track sales performance and commission by sales staff</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={8}>
              <label className="block text-sm font-medium mb-2">Date Range:</label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
                format="YYYY-MM-DD"
              />
            </Col>
            <Col span={8}>
              <label className="block text-sm font-medium mb-2">Staff Filter:</label>
              <Select
                value={selectedStaff}
                onChange={setSelectedStaff}
                className="w-full"
                options={staffOptions}
              />
            </Col>
            <Col span={8}>
              <label className="block text-sm font-medium mb-2">Actions:</label>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={exportReport}
                className="w-full"
              >
                Export Report
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Summary Statistics */}
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Sales"
                value={summaryStats.totalSales}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="VND"
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Orders"
                value={summaryStats.totalOrders}
                prefix={<ShoppingCartOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Average Order Value"
                value={summaryStats.averageOrderValue}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="VND"
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Top Performer"
                value={summaryStats.topPerformer?.staffName || "N/A"}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={24}>
          {/* Sales Performance Table */}
          <Col span={16}>
            <Card title="Sales Performance by Staff" className="h-full">
              <Spin spinning={loading}>
                <Table
                  dataSource={salesData}
                  columns={columns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </Spin>
            </Card>
          </Col>

          {/* Charts */}
          <Col span={8}>
            <Card title="Revenue Distribution" className="mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={staffPerformance.slice(0, 5)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalRevenue"
                  >
                    {staffPerformance.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card title="Monthly Sales Trend">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#1677ff" 
                    strokeWidth={2}
                    dot={{ fill: '#1677ff', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Performance Comparison Chart */}
        <Card title="Performance Comparison" className="mt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staffPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="staffName" />
              <YAxis />
              <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
              <Bar dataKey="totalRevenue" fill="#1677ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </DealerLayout>
  );
}
