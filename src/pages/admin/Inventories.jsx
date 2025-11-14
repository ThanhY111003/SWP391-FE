import { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Space,
  Tag,
  Button,
  Input,
  Select,
  Modal,
  Spin,
  message,
  Typography,
} from "antd";
import { EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import api from "../../config/axios";

export default function Inventories() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [inventories, setInventories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [dealerFilter, setDealerFilter] = useState("all"); // all | dealerId
  const [dealers, setDealers] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(false);

  // Vehicles modal state
  const [vehiclesOpen, setVehiclesOpen] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [currentInventory, setCurrentInventory] = useState(null);

  const normalizeList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
  };

  const fetchInventories = async () => {
    setLoading(true);
    try {
      const res = await api.get("inventories");
      const list = normalizeList(res?.data);
      setInventories(list);
    } catch (err) {
      console.error("Fetch inventories failed", err);
      messageApi.error(
        err?.response?.data?.message || "Không tải được hàng tồn kho"
      );
      setInventories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    setDealersLoading(true);
    try {
      const res = await api.get("dealers");
      const payload = res?.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.content)) list = payload.content;
      setDealers(list);
    } catch (err) {
      console.error("Fetch dealers failed", err);
      messageApi.error(
        err?.response?.data?.message || "Không tải được danh sách đại lý"
      );
      setDealers([]);
    } finally {
      setDealersLoading(false);
    }
  };

  const openVehicles = async (inventory) => {
    if (!inventory?.id) return;
    setCurrentInventory(inventory);
    setVehiclesOpen(true);
    setVehiclesLoading(true);
    try {
      const res = await api.get(`inventories/${inventory.id}/vehicles`);
      const list = normalizeList(res?.data);
      setVehicles(list);
    } catch (err) {
      console.error("Fetch vehicles failed", err);
      messageApi.error(
        err?.response?.data?.message || "Không tải được danh sách xe"
      );
      setVehicles([]);
    } finally {
      setVehiclesLoading(false);
    }
  };

  useEffect(() => {
    fetchInventories();
    fetchDealers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (inventories || []).filter((it) => {
      if (statusFilter === "active" && !it.isActive) return false;
      if (statusFilter === "inactive" && it.isActive) return false;
      // Lọc theo đại lý: ưu tiên dealerId nếu backend trả về;
      // nếu không có dealerId thì so sánh theo dealerName với dealer đã chọn
      if (dealerFilter !== "all") {
        if (it.dealerId != null) {
          if (String(it.dealerId) !== String(dealerFilter)) return false;
        } else {
          const selected = dealers.find(
            (d) => String(d.id) === String(dealerFilter)
          );
          const selectedName = selected?.name || selected?.dealerName;
          if (selectedName && String(it.dealerName) !== String(selectedName))
            return false;
        }
      }
      if (!q) return true;
      const hay = [it.dealerName, it.modelName, it.colorName]
        .map((x) => String(x || "").toLowerCase())
        .join(" ");
      return hay.includes(q);
    });
  }, [inventories, search, statusFilter, dealerFilter, dealers]);

  const dealerOptions = useMemo(() => {
    const options = (dealers || [])
      .filter((d) => d?.id != null)
      .map((d) => ({
        value: String(d.id),
        label: d.name || d.dealerName || `Đại lý ${d.id}`,
      }));
    // Remove duplicates by value
    const uniq = new Map(options.map((o) => [o.value, o]));
    return [
      { value: "all", label: "Tất cả đại lý" },
      ...Array.from(uniq.values()),
    ];
  }, [dealers]);

  const columns = [
    {
      title: "STT",
      key: "idx",
      width: 70,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    { title: "Model", dataIndex: "modelName", key: "modelName" },
    { title: "Màu", dataIndex: "colorName", key: "colorName" },
    {
      title: "Tổng",
      dataIndex: "totalQuantity",
      key: "totalQuantity",
      width: 100,
      align: "right",
    },
    {
      title: "Giữ chỗ",
      dataIndex: "reservedQuantity",
      key: "reservedQuantity",
      width: 100,
      align: "right",
    },
    {
      title: "Còn lại",
      dataIndex: "availableQuantity",
      key: "availableQuantity",
      width: 100,
      align: "right",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (v) => (
        <Tag color={v ? "green" : "default"}>{v ? "Hoạt động" : "Ngừng"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => openVehicles(record)}
          />
        </Space>
      ),
    },
  ];

  const vehicleColumns = [
    {
      title: "STT",
      key: "idx",
      width: 70,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Số máy", dataIndex: "engineNumber", key: "engineNumber" },
    { title: "Trạng thái", dataIndex: "status", key: "status" },
    { title: "Model", dataIndex: "modelName", key: "modelName" },
    { title: "Màu", dataIndex: "colorName", key: "colorName" },
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (v) => (
        <Tag color={v ? "green" : "default"}>{v ? "Hoạt động" : "Ngừng"}</Tag>
      ),
    },
    {
      title: "Ngày SX",
      dataIndex: "manufacturingDate",
      key: "manufacturingDate",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "Giá trị hiện tại",
      dataIndex: "currentValue",
      key: "currentValue",
      align: "right",
      render: (v) => (v != null ? Number(v).toLocaleString() + " VND" : "-"),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Card
        title={
          <Typography.Title level={4} style={{ margin: 0 }}>
            Hàng tồn kho
          </Typography.Title>
        }
        extra={
          <Space>
            <Input.Search
              allowClear
              placeholder="Tìm theo đại lý, model, màu"
              style={{ width: 280 }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={dealerFilter}
              style={{ width: 220 }}
              onChange={setDealerFilter}
              options={dealerOptions}
              loading={dealersLoading}
            />
            <Select
              value={statusFilter}
              style={{ width: 160 }}
              onChange={setStatusFilter}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Hoạt động", value: "active" },
                { label: "Ngừng", value: "inactive" },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={fetchInventories}>
              Tải lại
            </Button>
          </Space>
        }
      >
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey={(r) =>
            String(
              r?.id ??
                `${r?.dealerName ?? "-"}-${r?.modelName ?? "-"}-${
                  r?.colorName ?? "-"
                }`
            )
          }
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        open={vehiclesOpen}
        title={
          <span>
            Xe thuộc kho: <b>{currentInventory?.dealerName}</b> -{" "}
            {currentInventory?.modelName}
          </span>
        }
        onCancel={() => setVehiclesOpen(false)}
        footer={null}
        width={1000}
      >
        {vehiclesLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : (
          <Table
            size="middle"
            dataSource={vehicles}
            columns={vehicleColumns}
            rowKey={(r) =>
              String(r?.id ?? r?.vin ?? `${r?.engineNumber ?? ""}`)
            }
            pagination={{ pageSize: 10, showSizeChanger: true }}
          />
        )}
      </Modal>
    </div>
  );
}
