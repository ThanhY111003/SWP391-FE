// src/pages/dealer/vehicle-list.jsx
import { Card, Statistic, Row, Col, Skeleton } from "antd";
import { useEffect, useState } from "react";
import DealerLayout from "../components/dealerlayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DealerDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStaff: 0,
    totalOrders: 0,
    activeVehicles: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // 🧪 Sử dụng mock data trực tiếp (không gọi API)
    setTimeout(() => {
      setStats({
        totalStaff: 8,
        totalOrders: 25,
        activeVehicles: 40,
        revenue: 120000000,
      });
      setChartData([
        { month: "Jan", sales: 8 },
        { month: "Feb", sales: 12 },
        { month: "Mar", sales: 10 },
        { month: "Apr", sales: 16 },
        { month: "May", sales: 20 },
        { month: "Jun", sales: 15 },
      ]);
      setLoading(false);
    }, 1000); // Giả lập loading 1 giây
  }, []);

  return (
    <DealerLayout>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Dealer Dashboard</h2>

        {loading ? (
          <Skeleton active />
        ) : (
          <>
            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Card className="shadow-md">
                  <Statistic title="Total number of employees" value={stats.totalStaff} />
                </Card>
              </Col>
              <Col span={6}>
                <Card className="shadow-md">
                  <Statistic title="Total orders" value={stats.totalOrders} />
                </Card>
              </Col>
              <Col span={6}>
                <Card className="shadow-md">
                  <Statistic title="Active vehicles" value={stats.activeVehicles} />
                </Card>
              </Col>
              <Col span={6}>
                <Card className="shadow-md">
                  <Statistic
                    title="Revenue (VND)"
                    value={stats.revenue}
                    precision={0}
                  />
                </Card>
              </Col>
            </Row>

            {/* Biểu đồ doanh số */}
            <Card className="mt-8 shadow-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">
                Doanh số bán hàng theo tháng
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#1677ff" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}
      </div>
    </DealerLayout>
  );
}
