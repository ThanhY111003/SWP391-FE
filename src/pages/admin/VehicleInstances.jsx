import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Table,
  Space,
  Select,
  Input,
  Tag,
  Typography,
  Switch,
  message,
  Modal,
  Descriptions,
  Spin,
  Popconfirm,
  Button,
  Tooltip,
} from "antd";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const { Title } = Typography;

export default function VehicleInstances() {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [dealerIdFilter, setDealerIdFilter] = useState();
  const [search, setSearch] = useState("");
  const [dealers, setDealers] = useState([]);
  const [dealersLoading, setDealersLoading] = useState(false);
  const [rowToggling, setRowToggling] = useState({}); // id -> boolean
  const [statusFilter, setStatusFilter] = useState("all"); // all | specific status
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState({}); // id -> boolean

  const fetchData = async (dealerId) => {
    setLoading(true);
    try {
      const res = await api.get("vehicle-instances", {
        params: dealerId ? { dealerId } : undefined,
      });
      const payload = res?.data;
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setList(data);
    } catch (e) {
      console.error("Fetch vehicle-instances failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dealerIdFilter);
  }, [dealerIdFilter]);

  // Fetch dealers for filter options
  const fetchDealers = async () => {
    setDealersLoading(true);
    try {
      const res = await api.get("dealers");
      const payload = res?.data;
      let data = [];
      if (Array.isArray(payload)) data = payload;
      else if (Array.isArray(payload?.data)) data = payload.data;
      else if (Array.isArray(payload?.content)) data = payload.content;
      setDealers(data);
    } catch (e) {
      console.error("Fetch dealers failed", e);
      setDealers([]);
    } finally {
      setDealersLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const dealerOptions = useMemo(() => {
    return (dealers || []).map((d) => ({
      label: d?.name || `Đại lý #${d?.id}`,
      value: d?.id,
    }));
  }, [dealers]);

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    return (list || []).filter((x) => {
      if (dealerIdFilter) {
        // Ưu tiên lọc theo dealerId nếu backend có trả; fallback so sánh theo tên
        if (x.dealerId != null) {
          if (String(x.dealerId) !== String(dealerIdFilter)) return false;
        } else {
          const selected = dealers.find(
            (d) => String(d.id) === String(dealerIdFilter)
          );
          const selectedName = selected?.name;
          if (selectedName && x.dealerName !== selectedName) return false;
        }
      }
      if (statusFilter !== "all" && String(x.status) !== String(statusFilter)) {
        return false;
      }
      if (!q) return true;
      const hay = [
        x.vin,
        x.modelName,
        x.colorName,
        x.dealerName,
        x.engineNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [list, dealers, dealerIdFilter, statusFilter, search]);

  const statusOptions = useMemo(() => {
    const uniq = new Map();
    (list || []).forEach((x) => {
      if (x.status) {
        const v = String(x.status);
        if (!uniq.has(v)) uniq.set(v, { label: v, value: v });
      }
    });
    return [
      { label: "Tất cả trạng thái", value: "all" },
      ...Array.from(uniq.values()),
    ];
  }, [list]);

  const openDetail = async (record) => {
    if (!record?.id) return;
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`vehicle-instances/${record.id}`);
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      const data = res?.data?.data || res?.data;
      if (success && data) {
        setDetailRecord(data);
      } else {
        messageApi.error(res?.data?.message || "Không lấy được chi tiết xe");
        setDetailRecord(null);
      }
    } catch (e) {
      messageApi.error(
        e?.response?.data?.message || e.message || "Không lấy được chi tiết xe"
      );
      setDetailRecord(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleInstanceStatus = async (id, enable) => {
    try {
      const url = enable
        ? `vehicle-instances/${id}/activate`
        : `vehicle-instances/${id}/deactivate`;
      const res = await api.patch(url);
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      return { success, message: res?.data?.message };
    } catch (e) {
      return {
        success: false,
        message:
          e?.response?.data?.message ||
          e.message ||
          "Không thể cập nhật trạng thái",
      };
    }
  };

  const handleToggleActive = async (record, nextChecked) => {
    const id = record?.id ?? record?.vin;
    if (id == null) return;
    setRowToggling((prev) => ({ ...prev, [id]: true }));
    // optimistic update
    setList((prev) =>
      prev.map((x) =>
        x.id === record.id ? { ...x, isActive: nextChecked } : x
      )
    );
    const result = await toggleInstanceStatus(record.id, nextChecked);
    if (result.success) {
      messageApi.success(
        nextChecked
          ? "Kích hoạt xe thành công"
          : "Ngừng hoạt động xe thành công"
      );
      // refresh to ensure server state
      await fetchData(dealerIdFilter);
    } else {
      // rollback
      setList((prev) =>
        prev.map((x) =>
          x.id === record.id ? { ...x, isActive: !nextChecked } : x
        )
      );
      messageApi.error(result.message);
    }
    setRowToggling((prev) => ({ ...prev, [id]: false }));
  };

  const updateInstanceStatus = async (id, nextStatus) => {
    try {
      // Backend expects status as a query param, not JSON body
      const res = await api.put(`vehicle-instances/${id}/status`, null, {
        params: { status: nextStatus },
      });
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      return { success, message: res?.data?.message };
    } catch (e) {
      return {
        success: false,
        message:
          e?.response?.data?.message ||
          e.message ||
          "Không thể cập nhật trạng thái xe",
      };
    }
  };

  const changeInstanceStatus = async (record, nextStatus) => {
    const id = record?.id ?? record?.vin;
    if (id == null || !nextStatus) return;
    setStatusUpdating((prev) => ({ ...prev, [id]: true }));
    const result = await updateInstanceStatus(record.id, nextStatus);
    if (result.success) {
      const label =
        nextStatus === "IN_STOCK"
          ? "Trong kho"
          : nextStatus === "RESERVED"
          ? "Giữ chỗ"
          : nextStatus;
      messageApi.success(`Đã chuyển trạng thái sang ${label}`);
      await fetchData(dealerIdFilter);
    } else {
      messageApi.error(result.message);
    }
    setStatusUpdating((prev) => ({ ...prev, [id]: false }));
  };

  const columns = [
    {
      title: "STT",
      key: "idx",
      width: 70,
      align: "center",
      render: (_v, _r, i) => i + 1,
    },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    { title: "Model", dataIndex: "modelName", key: "modelName" },
    { title: "Màu", dataIndex: "colorName", key: "colorName" },
    { title: "Đại lý", dataIndex: "dealerName", key: "dealerName" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const label = v || "-";
        const color =
          v === "IN_STOCK"
            ? "blue"
            : v === "RESERVED"
            ? "gold"
            : v === "SOLD"
            ? "green"
            : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufacturingDate",
      key: "manufacturingDate",
      render: (v) => (v ? new Date(v).toLocaleDateString() : "-"),
    },
    {
      title: "Hoạt động",
      key: "isActive",
      width: 180,
      align: "center",
      render: (_v, record) => {
        const active = !!record?.isActive;
        const id = record?.id ?? record?.vin;
        const loading = !!rowToggling[id];
        return (
          <Space size="small">
            <Tag
              color={active ? "green" : "default"}
              style={{
                display: "inline-block",
                minWidth: 96,
                textAlign: "center",
              }}
            >
              {active ? "Hoạt động" : "Ngừng"}
            </Tag>
            <Switch
              checked={active}
              loading={loading}
              size="small"
              onChange={(checked) => handleToggleActive(record, checked)}
            />
          </Space>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      align: "center",
      render: (_, record) => {
        const id = record?.id ?? record?.vin;
        const updating = !!statusUpdating[id];
        const status = String(record?.status || "");
        const nextStatus =
          status === "IN_STOCK"
            ? "RESERVED"
            : status === "RESERVED"
            ? "IN_STOCK"
            : null;
        const nextLabel =
          nextStatus === "IN_STOCK"
            ? "Trong kho (IN_STOCK)"
            : nextStatus === "RESERVED"
            ? "Giữ chỗ (RESERVED)"
            : null;
        return (
          <Space size="small">
            <a onClick={() => openDetail(record)} title="Xem chi tiết">
              <EyeOutlined />
            </a>
            {nextStatus ? (
              <Popconfirm
                title={`Chuyển sang trạng thái ${nextLabel}?`}
                okText="Xác nhận"
                cancelText="Hủy"
                onConfirm={() => changeInstanceStatus(record, nextStatus)}
              >
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  loading={updating}
                />
              </Popconfirm>
            ) : (
              <Tooltip title="Chỉ chỉnh giữa IN_STOCK và RESERVED">
                <Button type="text" icon={<EditOutlined />} disabled />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Card
      title={
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={3} style={{ margin: 0 }}>
            Danh sách xe vật lý
          </Title>
        </Space>
      }
    >
      {contextHolder}
      <Space style={{ marginBottom: 12 }} wrap>
        <Select
          allowClear
          placeholder="Lọc theo đại lý"
          style={{ width: 220 }}
          options={dealerOptions}
          value={dealerIdFilter}
          onChange={setDealerIdFilter}
          loading={dealersLoading}
        />
        <Select
          value={statusFilter}
          style={{ width: 180 }}
          options={statusOptions}
          onChange={setStatusFilter}
        />
        <Input.Search
          allowClear
          placeholder="Tìm theo VIN / model / màu / đại lý / số máy"
          style={{ width: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={filtered}
        rowKey={(r) => r.id ?? r.vin}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />

      <Modal
        open={detailOpen}
        title="Chi tiết xe vật lý"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <Spin />
          </div>
        ) : detailRecord ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="VIN" span={2}>
              {detailRecord?.vin || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số máy">
              {detailRecord?.engineNumber || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag
                color={
                  detailRecord?.status === "IN_STOCK"
                    ? "blue"
                    : detailRecord?.status === "RESERVED"
                    ? "gold"
                    : detailRecord?.status === "SOLD"
                    ? "green"
                    : "default"
                }
              >
                {detailRecord?.status || "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Model">
              {detailRecord?.modelName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Màu">
              {detailRecord?.colorName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Đại lý" span={2}>
              {detailRecord?.dealerName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Hoạt động">
              <Tag color={detailRecord?.isActive ? "green" : "default"}>
                {detailRecord?.isActive ? "Hoạt động" : "Ngừng"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sản xuất">
              {detailRecord?.manufacturingDate
                ? new Date(detailRecord.manufacturingDate).toLocaleDateString()
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá trị hiện tại" span={2}>
              {detailRecord?.currentValue != null
                ? Number(detailRecord.currentValue).toLocaleString() + " VND"
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">
              {detailRecord?.createdAt
                ? new Date(detailRecord.createdAt).toLocaleString()
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật">
              {detailRecord?.updatedAt
                ? new Date(detailRecord.updatedAt).toLocaleString()
                : "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", color: "#999" }}>
            Không có dữ liệu
          </div>
        )}
      </Modal>
    </Card>
  );
}
