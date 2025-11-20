import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Typography,
  Select,
  Space,
  Button,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import api from "../../config/axios";
import toast from "react-hot-toast";

const { Title } = Typography;

export default function WarrantyRequests() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dealers, setDealers] = useState([]);
  const [dealerId, setDealerId] = useState();
  const [approvingIds, setApprovingIds] = useState(new Set());
  const [rejectingIds, setRejectingIds] = useState(new Set());
  const [completingIds, setCompletingIds] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState();

  const dealerOptions = dealers.map((d) => ({
    label: d.name || `Đại lý #${d.id}`,
    value: d.id,
  }));

  const fetchData = async (dealerIdParam, statusParam) => {
    // Nếu chưa có dealerId thì không gọi API để tránh lỗi 500 từ BE
    if (!dealerIdParam) {
      setData([]);
      return;
    }

    setLoading(true);
    try {
      const params = {
        ...(dealerIdParam ? { dealerId: dealerIdParam } : {}),
        ...(statusParam ? { status: statusParam } : {}),
      };
      const res = await api.get(
        "warranty/dealer/dealer/" + (dealerIdParam ?? ""),
        {
          params,
        }
      );
      const payload = res?.data;
      const list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      setData(list);
    } catch (e) {
      console.error("Fetch warranty requests failed", e);
      toast.error(
        e?.response?.data?.message ||
          "Không tải được danh sách yêu cầu bảo hành"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await api.get("dealers");
        const payload = res?.data;
        const list = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload)
          ? payload
          : [];
        setDealers(list);

        // Chọn mặc định một đại lý (ưu tiên đại lý Hà Nội nếu có)
        if (!dealerId && list.length > 0) {
          const defaultDealer =
            list.find((d) =>
              (d.name || "")
                .toLowerCase()
                .includes("hà nội".normalize("NFC").toLowerCase())
            ) || list[0];
          if (defaultDealer?.id) {
            setDealerId(defaultDealer.id);
          }
        }
      } catch (e) {
        console.error("Fetch dealers failed", e);
        toast.error(
          e?.response?.data?.message || "Không tải được danh sách đại lý"
        );
      }
    };

    fetchDealers();
  }, []);

  useEffect(() => {
    fetchData(dealerId, statusFilter);
  }, [dealerId, statusFilter]);

  const handleApprove = async (record) => {
    if (!record?.id) return;
    setApprovingIds((prev) => new Set(prev).add(record.id));
    try {
      const res = await api.patch(`warranty/dealer/${record.id}/approve`);
      const payload = res?.data;
      if (payload?.success === false) {
        throw new Error(
          payload?.message || "Phê duyệt yêu cầu bảo hành thất bại"
        );
      }
      toast.success(payload?.message || "Đã phê duyệt yêu cầu bảo hành");
      // cập nhật lại danh sách theo dealer hiện tại
      fetchData(dealerId);
    } catch (e) {
      console.error("Approve warranty request failed", e);
      toast.error(
        e?.response?.data?.message ||
          e.message ||
          "Không thể phê duyệt yêu cầu bảo hành"
      );
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handleReject = async (record) => {
    if (!record?.id) return;
    setRejectingIds((prev) => new Set(prev).add(record.id));
    try {
      const res = await api.patch(`warranty/dealer/${record.id}/reject`);
      const payload = res?.data;
      if (payload?.success === false) {
        throw new Error(
          payload?.message || "Từ chối yêu cầu bảo hành thất bại"
        );
      }
      toast.success(payload?.message || "Đã từ chối yêu cầu bảo hành");
      fetchData(dealerId);
    } catch (e) {
      console.error("Reject warranty request failed", e);
      toast.error(
        e?.response?.data?.message ||
          e.message ||
          "Không thể từ chối yêu cầu bảo hành"
      );
    } finally {
      setRejectingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
  };

  const handleComplete = async (record) => {
    if (!record?.id) return;
    setCompletingIds((prev) => new Set(prev).add(record.id));
    try {
      const res = await api.patch(`warranty/dealer/${record.id}/complete`);
      const payload = res?.data;
      if (payload?.success === false) {
        throw new Error(payload?.message || "Hoàn tất bảo hành thất bại");
      }
      toast.success(payload?.message || "Đã hoàn tất bảo hành");
      fetchData(dealerId, statusFilter);
    } catch (e) {
      console.error("Complete warranty request failed", e);
      toast.error(
        e?.response?.data?.message || e.message || "Không thể hoàn tất bảo hành"
      );
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(record.id);
        return next;
      });
    }
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
    { title: "Lý do", dataIndex: "reason", key: "reason" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => {
        const label = v || "-";
        const color =
          v === "PENDING"
            ? "gold"
            : v === "APPROVED"
            ? "green"
            : v === "REJECTED"
            ? "red"
            : "default";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Tạo lúc",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY HH:mm") : "-"),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 320,
      render: (_, record) => {
        const pending = record?.status === "PENDING";
        const approved = record?.status === "APPROVED";
        const loadingApprove = approvingIds.has(record.id);
        const loadingReject = rejectingIds.has(record.id);
        const loadingComplete = completingIds.has(record.id);
        return (
          <Space size="small">
            <Popconfirm
              title="Xác nhận phê duyệt"
              description="Bạn có chắc chắn muốn phê duyệt yêu cầu bảo hành này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => handleApprove(record)}
              disabled={!pending || loadingApprove}
            >
              <Button
                type="primary"
                size="small"
                disabled={!pending}
                loading={loadingApprove}
              >
                Duyệt
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Xác nhận từ chối"
              description="Bạn có chắc chắn muốn từ chối yêu cầu bảo hành này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => handleReject(record)}
              disabled={!pending || loadingReject}
            >
              <Button
                danger
                type="default"
                size="small"
                disabled={!pending}
                loading={loadingReject}
              >
                Từ chối
              </Button>
            </Popconfirm>
            <Popconfirm
              title="Xác nhận hoàn tất"
              description="Bạn có chắc chắn đã hoàn tất bảo hành cho yêu cầu này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => handleComplete(record)}
              disabled={!approved || loadingComplete}
            >
              <Button
                type="default"
                size="small"
                disabled={!approved}
                loading={loadingComplete}
              >
                Hoàn tất
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const filteredData = statusFilter
    ? data.filter((item) => item.status === statusFilter)
    : data;

  return (
    <Card>
      <Space
        style={{
          marginBottom: 12,
          width: "100%",
          justifyContent: "space-between",
        }}
        align="center"
        wrap
      >
        <Title level={3} style={{ margin: 0 }}>
          Yêu cầu bảo hành
        </Title>
        <Space wrap>
          <Select
            allowClear
            placeholder="Lọc theo đại lý"
            style={{ minWidth: 220 }}
            options={dealerOptions}
            value={dealerId}
            onChange={setDealerId}
          />
          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            style={{ minWidth: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: "Đang chờ xử lý", value: "PENDING" },
              { label: "Đã duyệt", value: "APPROVED" },
              { label: "Đã từ chối", value: "REJECTED" },
            ]}
          />
        </Space>
      </Space>
      <Table
        rowKey={(r) => r.id ?? `${r.vehicleId}-${r.vin}`}
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: false }}
      />
    </Card>
  );
}
