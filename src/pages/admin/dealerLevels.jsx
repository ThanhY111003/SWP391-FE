import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Tag,
  message,
  Tooltip,
  Descriptions,
  Spin,
} from "antd";
import { Popconfirm } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

// Helper to safely pick array from varying response shapes
const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

export default function DealerLevels() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null);
  const [form] = Form.useForm();
  const [deletingId, setDeletingId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const fetchLevels = async () => {
    setLoading(true);
    try {
      // Primary endpoint
      let res = await api.get("dealer-levels");
      let list = pickArray(res.data);
      // Fallback to /all if empty
      if (!list.length) {
        try {
          res = await api.get("dealer-levels/all");
          list = pickArray(res.data);
        } catch {
          // ignore and keep list as empty
        }
      }
      // Sort by levelNumber asc
      list.sort((a, b) => (a.levelNumber ?? 0) - (b.levelNumber ?? 0));
      setLevels(list);
    } catch (err) {
      console.error("Fetch dealer levels failed", err);
      messageApi.error(
        err?.response?.data?.message || "Không tải được cấp đại lý"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open create modal
  const openCreate = () => {
    form.resetFields();
    setModalMode("create");
    setCurrentId(null);
    setIsModalOpen(true);
  };

  // Open edit modal with data
  const openEdit = (record) => {
    setModalMode("edit");
    setCurrentId(record.id);
    form.setFieldsValue({
      levelName: record.levelName,
      levelNumber: record.levelNumber,
      discountRate: record.discountRate,
      depositRate: record.depositRate,
      maxOrderQuantity: record.maxOrderQuantity,
      creditLimit: record.creditLimit,
      maxInstallmentMonths: record.maxInstallmentMonths,
      description: record.description,
    });
    setIsModalOpen(true);
  };

  // Create or update submit
  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        levelName: values.levelName?.trim(),
        levelNumber: values.levelNumber,
        discountRate: values.discountRate,
        depositRate: values.depositRate,
        maxOrderQuantity: values.maxOrderQuantity,
        creditLimit: values.creditLimit,
        maxInstallmentMonths: values.maxInstallmentMonths,
        description: values.description?.trim(),
      };

      if (modalMode === "create") {
        const hide = messageApi.loading({
          content: "Đang tạo...",
          key: "level-save",
        });
        // Primary: POST /api/dealer-levels ; Fallback: /api/dealer-levels/create
        try {
          await api.post("dealer-levels", payload);
        } catch {
          // Try fallback
          await api.post("dealer-levels/create", payload);
        }
        hide();
        messageApi.success({
          content: "Tạo cấp đại lý thành công",
          key: "level-save",
        });
      } else {
        const hide = messageApi.loading({
          content: "Đang lưu...",
          key: "level-save",
        });
        // Primary: PUT /api/dealer-levels/{id} ; Fallback: /api/dealer-levels/edit/{id}
        try {
          await api.put(`dealer-levels/${currentId}`, payload);
        } catch {
          await api.put(`dealer-levels/edit/${currentId}`, payload);
        }
        hide();
        messageApi.success({
          content: "Cập nhật cấp đại lý thành công",
          key: "level-save",
        });
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchLevels();
    } catch (err) {
      if (err?.errorFields) return; // antd validation error
      console.error("Save dealer level failed", err);
      messageApi.error(
        err?.response?.data?.message ||
          (modalMode === "create"
            ? "Tạo cấp đại lý thất bại"
            : "Cập nhật cấp đại lý thất bại")
      );
    }
  };

  const onDelete = async (record) => {
    setDeletingId(record.id);
    try {
      try {
        await api.delete(`dealer-levels/${record.id}`);
      } catch {
        await api.delete(`dealer-levels/delete/${record.id}`);
      }
      messageApi.success("Đã xoá cấp đại lý");
      fetchLevels();
    } catch (err) {
      console.error("Delete level failed", err);
      messageApi.error(err?.response?.data?.message || "Xoá thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  // View detail
  const openDetail = async (record) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetail(null);
    try {
      // Try fetch detail to ensure latest data
      let res = await api.get(`dealer-levels/${record.id}`);
      let payload = res.data?.data ?? res.data;
      // Fallback to current record if API returns nothing expected
      setDetail(payload?.id ? payload : record);
    } catch (err) {
      console.warn(
        "Fetch dealer level detail failed, fallback to row data",
        err
      );
      setDetail(record);
    } finally {
      setDetailLoading(false);
    }
  };

  const columns = [
    {
      title: "Cấp",
      dataIndex: "levelNumber",
      width: 90,
      sorter: (a, b) => (a.levelNumber ?? 0) - (b.levelNumber ?? 0),
      render: (n) => <Tag color="blue">Cấp {n}</Tag>,
    },
    { title: "Tên cấp", dataIndex: "levelName" },
    {
      title: "Chiết khấu (%)",
      dataIndex: "discountRate",
      width: 130,
      render: (v) => v ?? "-",
    },
    {
      title: "Đặt cọc (%)",
      dataIndex: "depositRate",
      width: 120,
      render: (v) => v ?? "-",
    },
    {
      title: "SL tối đa/đơn",
      dataIndex: "maxOrderQuantity",
      width: 130,
    },
    {
      title: "Hạn mức (VNĐ)",
      dataIndex: "creditLimit",
      width: 150,
      render: (v) => (typeof v === "number" ? v.toLocaleString("vi-VN") : v),
    },
    {
      title: "Trả góp tối đa (tháng)",
      dataIndex: "maxInstallmentMonths",
      width: 170,
    },
    { title: "Mô tả", dataIndex: "description", ellipsis: true },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title={`Xoá cấp đại lý: Cấp ${record.levelNumber} - ${record.levelName}?`}
            okText="Xoá"
            cancelText="Huỷ"
            okButtonProps={{ danger: true, loading: deletingId === record.id }}
            onConfirm={() => onDelete(record)}
          >
            <Tooltip title="Xoá">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý cấp đại lý"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm cấp
        </Button>
      }
    >
      {contextHolder}
      <Table
        rowKey={(r) => r.id ?? `${r.levelNumber}-${r.levelName}`}
        columns={columns}
        dataSource={levels}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={isModalOpen}
        title={
          modalMode === "create" ? "Thêm cấp đại lý" : "Cập nhật cấp đại lý"
        }
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        okText={modalMode === "create" ? "Tạo" : "Lưu"}
        cancelText="Huỷ"
        width={680}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên cấp"
            name="levelName"
            rules={[{ required: true, message: "Vui lòng nhập tên cấp" }]}
          >
            <Input maxLength={100} allowClear />
          </Form.Item>

          <Form.Item
            label="Số cấp (1-99)"
            name="levelNumber"
            rules={[{ required: true, message: "Vui lòng nhập số cấp" }]}
          >
            <InputNumber className="w-full" min={1} max={99} />
          </Form.Item>

          <Space size="middle" style={{ display: "flex" }}>
            <Form.Item
              label="Chiết khấu (%)"
              name="discountRate"
              style={{ flex: 1 }}
              rules={[{ type: "number", min: 0, max: 100 }]}
            >
              <InputNumber className="w-full" min={0} max={100} step={0.1} />
            </Form.Item>
            <Form.Item
              label="Đặt cọc (%)"
              name="depositRate"
              style={{ flex: 1 }}
              rules={[{ type: "number", min: 0, max: 100 }]}
            >
              <InputNumber className="w-full" min={0} max={100} step={0.1} />
            </Form.Item>
          </Space>

          <Space size="middle" style={{ display: "flex" }}>
            <Form.Item
              label="SL tối đa/đơn"
              name="maxOrderQuantity"
              style={{ flex: 1 }}
              rules={[{ type: "number", min: 1 }]}
            >
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item
              label="Hạn mức (VNĐ)"
              name="creditLimit"
              style={{ flex: 1 }}
              rules={[{ type: "number", min: 0 }]}
            >
              <InputNumber className="w-full" min={0} step={1000000} />
            </Form.Item>
          </Space>

          <Form.Item
            label="Trả góp tối đa (tháng)"
            name="maxInstallmentMonths"
            rules={[{ type: "number", min: 1, max: 36 }]}
          >
            <InputNumber className="w-full" min={1} max={36} />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={3} maxLength={500} showCount allowClear />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={detailOpen}
        title="Chi tiết cấp đại lý"
        footer={null}
        onCancel={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Spin />
          </div>
        ) : detail ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="ID">{detail.id}</Descriptions.Item>
            <Descriptions.Item label="Cấp">
              {detail.levelNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên cấp">
              {detail.levelName}
            </Descriptions.Item>
            <Descriptions.Item label="Chiết khấu (%)">
              {detail.discountRate ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Đặt cọc (%)">
              {detail.depositRate ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="SL tối đa/đơn">
              {detail.maxOrderQuantity ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Hạn mức (VNĐ)">
              {typeof detail.creditLimit === "number"
                ? detail.creditLimit.toLocaleString("vi-VN")
                : detail.creditLimit ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trả góp tối đa (tháng)">
              {detail.maxInstallmentMonths ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {detail.description || "-"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>Không có dữ liệu chi tiết.</div>
        )}
      </Modal>
    </Card>
  );
}
