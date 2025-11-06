// src/pages/dealer/vehiclePriceManagement.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Card,
  Tag,
  message,
  Descriptions,
  Modal,
  Space,
  DatePicker,
  Select,
  InputNumber,
  Spin,
  Empty,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function VehiclePriceManagement() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [dealerLevels, setDealerLevels] = useState([]);
  const [filters, setFilters] = useState({
    dealerLevelId: undefined,
    startDate: undefined,
    endDate: undefined,
  });

  //  1. Load danh sách dealer levels
  const fetchDealerLevels = async () => {
    try {
      const res = await apiClient.get("/api/dealer-levels");
      if (res.data.success) {
        setDealerLevels(res.data.data || []);
      } else {
        message.error(
          res.data.message || "Không thể tải danh sách cấp đại lý!"
        );
      }
    } catch (err) {
      console.error("Error fetching dealer levels:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách cấp đại lý!";
      message.error(errorMsg);
    }
  };

  //  2. Load danh sách bảng giá
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dealerLevelId) {
        params.append("dealerLevelId", filters.dealerLevelId);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate.format("YYYY-MM-DD"));
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate.format("YYYY-MM-DD"));
      }

      const res = await apiClient.get(
        `/api/vehicle-prices?${params.toString()}`
      );
      if (res.data.success) {
        setPrices(res.data.data || []);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải danh sách bảng giá!");
        setPrices([]);
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách bảng giá!";
      message.error(errorMsg);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  //  3. Lấy chi tiết bảng giá
  const fetchPriceDetail = async (id) => {
    try {
      const res = await apiClient.get(`/api/vehicle-prices/${id}`);
      if (res.data.success) {
        setSelectedPrice(res.data.data);
        setDetailModalOpen(true);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải chi tiết bảng giá!");
      }
    } catch (err) {
      console.error("Error fetching price detail:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải chi tiết bảng giá!";
      message.error(errorMsg);
    }
  };

  useEffect(() => {
    fetchDealerLevels();
  }, []);

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dealerLevelId, filters.startDate, filters.endDate]);

  //  4. Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  //  5. Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      return "N/A";
    }
  };

  //  6. Xử lý filter
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
      }));
    }
  };

  //  7. Reset filters
  const handleResetFilters = () => {
    setFilters({
      dealerLevelId: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  //  8. Cấu hình cột Table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Model xe",
      dataIndex: "vehicleModelName",
      key: "vehicleModelName",
      sorter: (a, b) =>
        (a.vehicleModelName || "").localeCompare(b.vehicleModelName || ""),
    },
    {
      title: "Màu xe",
      dataIndex: "colorName",
      key: "colorName",
      render: (color) => <Tag color="blue">{color || "N/A"}</Tag>,
    },
    {
      title: "Cấp đại lý",
      dataIndex: "dealerLevelName",
      key: "dealerLevelName",
      render: (level) => <Tag color="green">{level || "N/A"}</Tag>,
    },
    {
      title: "Giá bán buôn",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
      render: (price) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(price)}
        </span>
      ),
      sorter: (a, b) => (a.wholesalePrice || 0) - (b.wholesalePrice || 0),
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveFrom",
      key: "effectiveFrom",
      render: (date) => formatDate(date),
      sorter: (a, b) => {
        if (!a.effectiveFrom && !b.effectiveFrom) return 0;
        if (!a.effectiveFrom) return 1;
        if (!b.effectiveFrom) return -1;
        return dayjs(a.effectiveFrom).unix() - dayjs(b.effectiveFrom).unix();
      },
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "effectiveTo",
      key: "effectiveTo",
      render: (date) => formatDate(date),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Vô hiệu hóa", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => fetchPriceDetail(record.id)}
          size="small"
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quản lý bảng giá xe</h2>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchPrices}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </div>

          {/* Filters Section */}
          <Card className="mb-4" size="small">
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              <div className="flex flex-wrap gap-4">
                <div style={{ minWidth: "200px" }}>
                  <label className="block mb-2 text-sm font-medium">
                    Cấp đại lý
                  </label>
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Chọn cấp đại lý"
                    allowClear
                    value={filters.dealerLevelId}
                    onChange={(value) => handleFilterChange("dealerLevelId", value)}
                  >
                    {dealerLevels.map((level) => (
                      <Option key={level.id} value={level.id}>
                        Cấp {level.levelNumber} - {level.levelName}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div style={{ minWidth: "300px" }}>
                  <label className="block mb-2 text-sm font-medium">
                    Khoảng thời gian
                  </label>
                  <RangePicker
                    style={{ width: "100%" }}
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày", "Đến ngày"]}
                    value={
                      filters.startDate && filters.endDate
                        ? [filters.startDate, filters.endDate]
                        : null
                    }
                    onChange={handleDateRangeChange}
                  />
                </div>

                <div className="flex items-end">
                  <Space>
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={fetchPrices}
                      loading={loading}
                    >
                      Tìm kiếm
                    </Button>
                    <Button onClick={handleResetFilters}>Đặt lại</Button>
                  </Space>
                </div>
              </div>
            </Space>
          </Card>

          {/* Table */}
          <Spin spinning={loading}>
            {prices.length === 0 && !loading ? (
              <Empty
                description="Không có dữ liệu bảng giá"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={prices}
                loading={loading}
                bordered
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} bảng giá`,
                }}
              />
            )}
          </Spin>
        </Card>

        {/* Modal chi tiết bảng giá */}
        <Modal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedPrice(null);
          }}
          title="Chi tiết bảng giá"
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedPrice && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID">{selectedPrice.id}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedPrice.isActive ? "green" : "red"}>
                  {selectedPrice.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Model xe">
                {selectedPrice.vehicleModelName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Màu xe">
                <Tag color="blue">{selectedPrice.colorName || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Cấp đại lý">
                <Tag color="green">{selectedPrice.dealerLevelName || "N/A"}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán buôn">
                <span className="font-semibold text-green-600 text-lg">
                  {formatCurrency(selectedPrice.wholesalePrice)}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hiệu lực">
                {formatDate(selectedPrice.effectiveFrom)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hết hạn">
                {formatDate(selectedPrice.effectiveTo) || "Không giới hạn"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </DealerLayout>
  );
}

