// src/pages/dealer/debtReport.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Spin,
  message,
  Tabs,
  Progress,
  Alert,
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
  Line,
} from "recharts";
import {
  ExclamationCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CarOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
// import apiClient from "../../utils/axiosConfig"; // TODO: Uncomment when integrating real API
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

export default function DebtReport() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(90, "days"),
    dayjs(),
  ]);
  const [selectedDealer, setSelectedDealer] = useState("All");
  const [customerDebts, setCustomerDebts] = useState([]);
  const [manufacturerDebts, setManufacturerDebts] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    totalCustomerDebt: 0,
    totalManufacturerDebt: 0,
    overdueCount: 0,
    totalDebt: 0,
  });

  useEffect(() => {
    fetchDebtData();
  }, [dateRange, selectedDealer]);

  const fetchDebtData = async () => {
    setLoading(true);
    try {
      // Mock data for development
      setTimeout(() => {
        const mockCustomerDebts = [
          {
            id: 1,
            customerName: "Nguyễn Văn A",
            customerId: "CUST001",
            orderCode: "ORD-2024-001",
            orderDate: "2024-01-15",
            totalAmount: 45000000,
            paidAmount: 22500000,
            remainingAmount: 22500000,
            dueDate: "2024-02-15",
            daysOverdue: 0,
            status: "Current",
            installmentPlan: "2 months",
            nextPaymentDate: "2024-02-15",
            nextPaymentAmount: 22500000,
          },
          {
            id: 2,
            customerName: "Trần Thị B",
            customerId: "CUST002",
            orderCode: "ORD-2024-002",
            orderDate: "2024-01-10",
            totalAmount: 65000000,
            paidAmount: 19500000,
            remainingAmount: 45500000,
            dueDate: "2024-01-25",
            daysOverdue: 15,
            status: "Overdue",
            installmentPlan: "3 months",
            nextPaymentDate: "2024-02-10",
            nextPaymentAmount: 22750000,
          },
          {
            id: 3,
            customerName: "Lê Văn C",
            customerId: "CUST003",
            orderCode: "ORD-2024-003",
            orderDate: "2024-01-20",
            totalAmount: 32000000,
            paidAmount: 32000000,
            remainingAmount: 0,
            dueDate: "2024-02-20",
            daysOverdue: 0,
            status: "Paid",
            installmentPlan: "1 month",
            nextPaymentDate: null,
            nextPaymentAmount: 0,
          },
          {
            id: 4,
            customerName: "Phạm Thị D",
            customerId: "CUST004",
            orderCode: "ORD-2024-004",
            orderDate: "2024-01-05",
            totalAmount: 85000000,
            paidAmount: 25500000,
            remainingAmount: 59500000,
            dueDate: "2024-01-20",
            daysOverdue: 20,
            status: "Overdue",
            installmentPlan: "4 months",
            nextPaymentDate: "2024-02-05",
            nextPaymentAmount: 19833333,
          },
        ];

        const mockManufacturerDebts = [
          {
            id: 1,
            dealerName: "AutoCity Dealer",
            dealerId: "DEALER001",
            orderCode: "ORD-2024-001",
            orderDate: "2024-01-15",
            totalAmount: 45000000,
            paidAmount: 22500000,
            remainingAmount: 22500000,
            dueDate: "2024-02-15",
            daysOverdue: 0,
            status: "Current",
            creditLimit: 100000000,
            availableCredit: 77500000,
            paymentTerms: "30 days",
          },
          {
            id: 2,
            dealerName: "AutoWorld Dealer",
            dealerId: "DEALER002",
            orderCode: "ORD-2024-002",
            orderDate: "2024-01-10",
            totalAmount: 65000000,
            paidAmount: 19500000,
            remainingAmount: 45500000,
            dueDate: "2024-01-25",
            daysOverdue: 15,
            status: "Overdue",
            creditLimit: 150000000,
            availableCredit: 104500000,
            paymentTerms: "30 days",
          },
          {
            id: 3,
            dealerName: "EV Motors",
            dealerId: "DEALER003",
            orderCode: "ORD-2024-003",
            orderDate: "2024-01-20",
            totalAmount: 32000000,
            paidAmount: 32000000,
            remainingAmount: 0,
            dueDate: "2024-02-20",
            daysOverdue: 0,
            status: "Paid",
            creditLimit: 80000000,
            availableCredit: 80000000,
            paymentTerms: "30 days",
          },
        ];

        setCustomerDebts(mockCustomerDebts);
        setManufacturerDebts(mockManufacturerDebts);

        const totalCustomerDebt = mockCustomerDebts.reduce(
          (sum, debt) => sum + debt.remainingAmount,
          0
        );
        const totalManufacturerDebt = mockManufacturerDebts.reduce(
          (sum, debt) => sum + debt.remainingAmount,
          0
        );
        const overdueCount = [
          ...mockCustomerDebts,
          ...mockManufacturerDebts,
        ].filter((debt) => debt.status === "Overdue").length;

        setSummaryStats({
          totalCustomerDebt,
          totalManufacturerDebt,
          overdueCount,
          totalDebt: totalCustomerDebt + totalManufacturerDebt,
        });

        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching debt data:", error);
      message.error("Failed to load debt data");
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "green";
      case "Current":
        return "blue";
      case "Overdue":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Paid":
        return <CheckCircleOutlined />;
      case "Current":
        return <ClockCircleOutlined />;
      case "Overdue":
        return <WarningOutlined />;
      default:
        return null;
    }
  };

  const customerColumns = [
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{record.customerId}</div>
        </div>
      ),
    },
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (code) => (
        <code className="bg-gray-100 px-2 py-1 rounded">{code}</code>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold">
            {amount.toLocaleString("vi-VN")} VND
          </div>
        </div>
      ),
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right text-green-600">
          {amount.toLocaleString("vi-VN")} VND
        </div>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold text-red-600">
            {amount.toLocaleString("vi-VN")} VND
          </div>
        </div>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date, record) => (
        <div>
          <div>{date}</div>
          {record.daysOverdue > 0 && (
            <div className="text-sm text-red-500">
              {record.daysOverdue} days overdue
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Next Payment",
      key: "nextPayment",
      render: (_, record) => (
        <div className="text-center">
          {record.nextPaymentDate ? (
            <>
              <div className="text-sm">{record.nextPaymentDate}</div>
              <div className="font-semibold text-blue-600">
                {record.nextPaymentAmount.toLocaleString("vi-VN")} VND
              </div>
            </>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </div>
      ),
    },
  ];

  const manufacturerColumns = [
    {
      title: "Dealer",
      dataIndex: "dealerName",
      key: "dealerName",
      render: (name, record) => (
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{record.dealerId}</div>
        </div>
      ),
    },
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (code) => (
        <code className="bg-gray-100 px-2 py-1 rounded">{code}</code>
      ),
    },
    {
      title: "Order Date",
      dataIndex: "orderDate",
      key: "orderDate",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold">
            {amount.toLocaleString("vi-VN")} VND
          </div>
        </div>
      ),
    },
    {
      title: "Paid Amount",
      dataIndex: "paidAmount",
      key: "paidAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right text-green-600">
          {amount.toLocaleString("vi-VN")} VND
        </div>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      align: "right",
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold text-red-600">
            {amount.toLocaleString("vi-VN")} VND
          </div>
        </div>
      ),
    },
    {
      title: "Credit Limit",
      dataIndex: "creditLimit",
      key: "creditLimit",
      align: "right",
      render: (limit, record) => (
        <div className="text-right">
          <div>{limit.toLocaleString("vi-VN")} VND</div>
          <div className="text-sm text-gray-500">
            Available: {record.availableCredit.toLocaleString("vi-VN")} VND
          </div>
        </div>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date, record) => (
        <div>
          <div>{date}</div>
          {record.daysOverdue > 0 && (
            <div className="text-sm text-red-500">
              {record.daysOverdue} days overdue
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)} icon={getStatusIcon(status)}>
          {status}
        </Tag>
      ),
    },
  ];

  const debtChartData = [
    {
      name: "Customer Debt",
      value: summaryStats.totalCustomerDebt,
      color: "#ff4d4f",
    },
    {
      name: "Manufacturer Debt",
      value: summaryStats.totalManufacturerDebt,
      color: "#1890ff",
    },
  ];

  const statusChartData = [
    {
      name: "Paid",
      value: [...customerDebts, ...manufacturerDebts].filter(
        (d) => d.status === "Paid"
      ).length,
      color: "#52c41a",
    },
    {
      name: "Current",
      value: [...customerDebts, ...manufacturerDebts].filter(
        (d) => d.status === "Current"
      ).length,
      color: "#1890ff",
    },
    {
      name: "Overdue",
      value: [...customerDebts, ...manufacturerDebts].filter(
        (d) => d.status === "Overdue"
      ).length,
      color: "#ff4d4f",
    },
  ];

  const exportReport = () => {
    message.success("Debt report exported successfully!");
  };

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            <ExclamationCircleOutlined className="mr-2" />
            Debt Report
          </h2>
          <p className="text-gray-600">
            Track outstanding debts from customers and to manufacturers
          </p>
        </div>

        {/* Alerts */}
        {summaryStats.overdueCount > 0 && (
          <Alert
            message={`${summaryStats.overdueCount} overdue payments detected`}
            description="Please review and follow up on overdue payments to maintain healthy cash flow."
            type="warning"
            showIcon
            className="mb-6"
          />
        )}

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={16} align="middle">
            <Col span={8}>
              <label className="block text-sm font-medium mb-2">
                Date Range:
              </label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
                format="YYYY-MM-DD"
              />
            </Col>
            <Col span={8}>
              <label className="block text-sm font-medium mb-2">
                Dealer Filter:
              </label>
              <Select
                value={selectedDealer}
                onChange={setSelectedDealer}
                className="w-full"
                placeholder="Select dealer"
              >
                <Option value="All">All Dealers</Option>
                <Option value="DEALER001">AutoCity Dealer</Option>
                <Option value="DEALER002">AutoWorld Dealer</Option>
                <Option value="DEALER003">EV Motors</Option>
              </Select>
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
                title="Total Customer Debt"
                value={summaryStats.totalCustomerDebt}
                precision={0}
                prefix={<UserOutlined />}
                suffix="VND"
                valueStyle={{ color: "#ff4d4f" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Manufacturer Debt"
                value={summaryStats.totalManufacturerDebt}
                precision={0}
                prefix={<CarOutlined />}
                suffix="VND"
                valueStyle={{ color: "#1890ff" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Outstanding Debt"
                value={summaryStats.totalDebt}
                precision={0}
                prefix={<DollarOutlined />}
                suffix="VND"
                valueStyle={{ color: "#722ed1" }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Overdue Payments"
                value={summaryStats.overdueCount}
                prefix={<WarningOutlined />}
                valueStyle={{ color: "#fa8c16" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Debt Overview Charts */}
        <Row gutter={16} className="mb-6">
          <Col span={12}>
            <Card title="Debt Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={debtChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {debtChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `${value.toLocaleString("vi-VN")} VND`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col span={12}>
            <Card title="Payment Status">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        {/* Detailed Debt Tables */}
        <Card>
          <Tabs defaultActiveKey="customers">
            <TabPane tab="Customer Debts" key="customers">
              <Spin spinning={loading}>
                <Table
                  dataSource={customerDebts}
                  columns={customerColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </Spin>
            </TabPane>
            <TabPane tab="Manufacturer Debts" key="manufacturers">
              <Spin spinning={loading}>
                <Table
                  dataSource={manufacturerDebts}
                  columns={manufacturerColumns}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </Spin>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </DealerLayout>
  );
}
