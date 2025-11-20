import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
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
  Upload,
  Form,
  DatePicker,
  InputNumber,
} from "antd";
import { EyeOutlined, EditOutlined, UploadOutlined } from "@ant-design/icons";
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
  // const [statusUpdating, setStatusUpdating] = useState({}); // id -> boolean (no longer used for status toggle)
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // lưu kết quả import để hiển thị
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [modelOptions, setModelOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingColors, setLoadingColors] = useState(false);
  const [selectedCreateModelId, setSelectedCreateModelId] = useState(null);
  const [selectedEditModelId, setSelectedEditModelId] = useState(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

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

  // Fetch all vehicle models for creating instances
  useEffect(() => {
    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const res = await api.get("vehicle-models");
        const payload = res?.data;
        let data = [];
        if (Array.isArray(payload)) data = payload;
        else if (Array.isArray(payload?.data)) data = payload.data;
        else if (Array.isArray(payload?.content)) data = payload.content;
        setModelOptions(
          (data || []).map((m) => ({
            label: m?.name || `Model #${m?.id}`,
            value: m?.id,
          }))
        );
      } catch (e) {
        console.error("Fetch vehicle-models failed", e);
        setModelOptions([]);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, []);

  const handleCreateModelChange = async (modelId) => {
    createForm.setFieldsValue({ vehicleModelColorId: undefined });
    editForm.setFieldsValue({ vehicleModelColorId: undefined });
    setSelectedCreateModelId(modelId || null);
    setSelectedEditModelId(modelId || null);
    if (!modelId) {
      setColorOptions([]);
      return;
    }
    setLoadingColors(true);
    try {
      const res = await api.get(`vehicle-models/${modelId}/colors`);
      const payload = res?.data;
      let data = [];
      if (Array.isArray(payload)) data = payload;
      else if (Array.isArray(payload?.data)) data = payload.data;
      setColorOptions(
        (data || []).map((c) => ({
          label: `${c.colorName}`,
          value: c.id,
        }))
      );
    } catch (e) {
      console.error("Fetch model colors failed", e);
      setColorOptions([]);
    } finally {
      setLoadingColors(false);
    }
  };

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
        x.customerName,
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

  // old change-status helpers removed; we now edit full vehicle info instead

  const uploadProps = {
    showUploadList: false,
    accept: ".xlsx,.xls,.csv",
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        setImporting(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("vehicle-instances/import", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const payload = res?.data;
        const data = payload?.data ?? payload;
        setImportResult(data || null);
        setImportModalOpen(true);

        const success = payload?.success ?? true;
        if (success) {
          messageApi.success(
            payload?.message || "Import danh sách xe thành công"
          );
          await fetchData(dealerIdFilter);
        } else {
          messageApi.error(payload?.message || "Import danh sách xe thất bại");
        }

        setImporting(false);
        if (onSuccess) onSuccess(null, res);
      } catch (e) {
        console.error("Import vehicle-instances failed", e);
        messageApi.error(
          e?.response?.data?.message || "Không thể import danh sách xe"
        );
        setImporting(false);
        if (onError) onError(e);
      }
    },
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
    { title: "Số máy", dataIndex: "engineNumber", key: "engineNumber" },
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
        return (
          <Space size="small">
            <a onClick={() => openDetail(record)} title="Xem chi tiết">
              <EyeOutlined />
            </a>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={async () => {
                if (!record?.id) return;
                setEditingRecord(record);
                setEditOpen(true);
                try {
                  // Lấy lại chi tiết đầy đủ để đảm bảo có vehicleModelColorId
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
                    // Tìm model theo tên nếu thiếu id
                    let modelId = data.vehicleModelId;
                    if (
                      !modelId &&
                      data.modelName &&
                      Array.isArray(modelOptions)
                    ) {
                      const foundModel = modelOptions.find(
                        (m) =>
                          m?.label &&
                          String(m.label).toLowerCase() ===
                            String(data.modelName).toLowerCase()
                      );
                      if (foundModel?.value) {
                        modelId = foundModel.value;
                      }
                    }

                    // load màu cho model hiện tại (nếu xác định được modelId)
                    let colorId = data.vehicleModelColorId;
                    if (modelId) {
                      await handleCreateModelChange(modelId);

                      // Nếu thiếu vehicleModelColorId, cố gắng map theo colorName
                      if (
                        !colorId &&
                        data.colorName &&
                        Array.isArray(colorOptions)
                      ) {
                        const foundColor = colorOptions.find(
                          (c) =>
                            c?.label &&
                            String(c.label).toLowerCase() ===
                              String(data.colorName).toLowerCase()
                        );
                        if (foundColor?.value) {
                          colorId = foundColor.value;
                        }
                      }

                      editForm.setFieldsValue({
                        vehicleModelId: modelId,
                        vehicleModelColorId: colorId,
                      });
                    } else {
                      editForm.setFieldsValue({
                        vehicleModelId: undefined,
                        vehicleModelColorId: undefined,
                      });
                    }
                    editForm.setFieldsValue({
                      vin: data.vin,
                      engineNumber: data.engineNumber,
                      manufacturingDate: data.manufacturingDate
                        ? dayjs(data.manufacturingDate)
                        : null,
                    });
                  } else {
                    messageApi.error(
                      res?.data?.message ||
                        "Không lấy được thông tin xe để chỉnh sửa"
                    );
                    setEditOpen(false);
                    setEditingRecord(null);
                  }
                } catch (e) {
                  messageApi.error(
                    e?.response?.data?.message ||
                      e.message ||
                      "Không lấy được thông tin xe để chỉnh sửa"
                  );
                  setEditOpen(false);
                  setEditingRecord(null);
                }
              }}
            />
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
          <Space>
            <Button type="primary" onClick={() => setCreateOpen(true)}>
              + Tạo xe
            </Button>
            <Upload {...uploadProps}>
              <Button
                type="default"
                icon={<UploadOutlined />}
                loading={importing}
              >
                Import từ Excel
              </Button>
            </Upload>
          </Space>
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
          placeholder="Tìm theo VIN / model / màu / đại lý / số máy / khách hàng"
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

      {/* Sửa thông tin xe vật lý */}
      <Modal
        open={editOpen}
        title="Chỉnh sửa xe vật lý"
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
          setEditingRecord(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={editing}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editingRecord?.id) return;
            try {
              setEditing(true);
              const payload = {
                vin: values.vin.trim(),
                engineNumber: values.engineNumber.trim(),
                vehicleModelColorId: Number(values.vehicleModelColorId),
                manufacturingDate:
                  values.manufacturingDate.format("YYYY-MM-DD"),
              };
              const res = await api.put(
                `vehicle-instances/${editingRecord.id}`,
                payload
              );
              const ok = res?.status >= 200 && res?.status < 300;
              const success = Object.prototype.hasOwnProperty.call(
                res?.data || {},
                "success"
              )
                ? !!res.data.success
                : ok;
              if (success) {
                messageApi.success(
                  res?.data?.message || "Cập nhật xe vật lý thành công"
                );
                setEditOpen(false);
                editForm.resetFields();
                setEditingRecord(null);
                await fetchData(dealerIdFilter);
              } else {
                messageApi.error(
                  res?.data?.message || "Cập nhật xe vật lý thất bại"
                );
              }
            } catch (e) {
              messageApi.error(
                e?.response?.data?.message ||
                  e.message ||
                  "Không thể cập nhật xe vật lý"
              );
            } finally {
              setEditing(false);
            }
          }}
        >
          <Form.Item
            label="Model"
            name="vehicleModelId"
            rules={[{ required: true, message: "Vui lòng chọn model" }]}
          >
            <Select
              placeholder="Chọn model"
              options={modelOptions}
              loading={loadingModels}
              onChange={handleCreateModelChange}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="VIN"
            name="vin"
            rules={[
              { required: true, message: "Vui lòng nhập VIN" },
              {
                validator: (_, value) => {
                  const v = (value || "").trim();
                  if (!v) return Promise.resolve();
                  if (v.length !== 17)
                    return Promise.reject(
                      new Error("VIN phải có đúng 17 ký tự")
                    );
                  const regex = /^[A-HJ-NPR-Z0-9]+$/i;
                  if (!regex.test(v))
                    return Promise.reject(
                      new Error("VIN chỉ được chứa chữ cái (trừ I,O,Q) và số")
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: 1HGBH41JXMN109186" maxLength={17} />
          </Form.Item>

          <Form.Item
            label="Số máy"
            name="engineNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số máy" },
              {
                min: 6,
                message: "Số máy phải có ít nhất 6 ký tự",
              },
              {
                pattern: /^[A-Z0-9]+$/i,
                message: "Số máy chỉ được chứa chữ cái và số",
              },
            ]}
          >
            <Input placeholder="VD: ENG123456" />
          </Form.Item>

          <Form.Item
            label="Màu xe"
            name="vehicleModelColorId"
            rules={[
              { required: true, message: "Vui lòng chọn màu" },
              {
                validator: (_, value) => {
                  if (value == null || value === "")
                    return Promise.reject(new Error("Vui lòng chọn màu"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              placeholder="Chọn màu cho model"
              options={colorOptions}
              loading={loadingColors}
              allowClear
              disabled={!selectedEditModelId}
            />
          </Form.Item>

          <Form.Item
            label="Ngày sản xuất"
            name="manufacturingDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sản xuất" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  const selected = value.toDate();
                  if (selected > today)
                    return Promise.reject(
                      new Error("Ngày sản xuất không được lớn hơn hôm nay")
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Tạo xe vật lý thủ công */}
      <Modal
        open={createOpen}
        title="Tạo xe vật lý"
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        confirmLoading={creating}
        destroyOnHidden
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setCreating(true);
              const payload = {
                vin: values.vin.trim(),
                engineNumber: values.engineNumber.trim(),
                vehicleModelColorId: Number(values.vehicleModelColorId),
                manufacturingDate:
                  values.manufacturingDate.format("YYYY-MM-DD"),
              };
              const res = await api.post("vehicle-instances", payload);
              const ok = res?.status >= 200 && res?.status < 300;
              const success = Object.prototype.hasOwnProperty.call(
                res?.data || {},
                "success"
              )
                ? !!res.data.success
                : ok;
              if (success) {
                messageApi.success(
                  res?.data?.message || "Tạo xe vật lý thành công"
                );
                setCreateOpen(false);
                createForm.resetFields();
                await fetchData(dealerIdFilter);
              } else {
                messageApi.error(
                  res?.data?.message || "Tạo xe vật lý thất bại"
                );
              }
            } catch (e) {
              messageApi.error(
                e?.response?.data?.message ||
                  e.message ||
                  "Không thể tạo xe vật lý"
              );
            } finally {
              setCreating(false);
            }
          }}
        >
          <Form.Item
            label="VIN"
            name="vin"
            rules={[
              { required: true, message: "Vui lòng nhập VIN" },
              {
                validator: (_, value) => {
                  const v = (value || "").trim();
                  if (!v) return Promise.resolve();
                  if (v.length !== 17)
                    return Promise.reject(
                      new Error("VIN phải có đúng 17 ký tự")
                    );
                  const regex = /^[A-HJ-NPR-Z0-9]+$/i;
                  if (!regex.test(v))
                    return Promise.reject(
                      new Error("VIN chỉ được chứa chữ cái (trừ I,O,Q) và số")
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="VD: 1HGBH41JXMN109186" maxLength={17} />
          </Form.Item>

          <Form.Item
            label="Số máy"
            name="engineNumber"
            rules={[
              { required: true, message: "Vui lòng nhập số máy" },
              {
                min: 6,
                message: "Số máy phải có ít nhất 6 ký tự",
              },
              {
                pattern: /^[A-Z0-9]+$/i,
                message: "Số máy chỉ được chứa chữ cái và số",
              },
            ]}
          >
            <Input placeholder="VD: ENG123456" />
          </Form.Item>

          <Form.Item
            label="Model"
            name="vehicleModelId"
            rules={[{ required: true, message: "Vui lòng chọn model" }]}
          >
            <Select
              placeholder="Chọn model"
              options={modelOptions}
              loading={loadingModels}
              onChange={handleCreateModelChange}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Màu xe"
            name="vehicleModelColorId"
            rules={[
              { required: true, message: "Vui lòng chọn màu" },
              {
                validator: (_, value) => {
                  if (value == null || value === "")
                    return Promise.reject(new Error("Vui lòng chọn màu"));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Select
              placeholder="Chọn màu cho model"
              options={colorOptions}
              loading={loadingColors}
              allowClear
              disabled={!selectedCreateModelId}
            />
          </Form.Item>

          <Form.Item
            label="Ngày sản xuất"
            name="manufacturingDate"
            rules={[
              { required: true, message: "Vui lòng chọn ngày sản xuất" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const today = new Date();
                  const selected = value.toDate();
                  if (selected > today)
                    return Promise.reject(
                      new Error("Ngày sản xuất không được lớn hơn hôm nay")
                    );
                  return Promise.resolve();
                },
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Kết quả import */}
      <Modal
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        title="Kết quả import xe vật lý"
        width={800}
      >
        {!importResult ? (
          <div style={{ textAlign: "center", color: "#999" }}>
            Không có dữ liệu import
          </div>
        ) : (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Space size="large">
              <span>Tổng dòng: {importResult.totalRows ?? 0}</span>
              <span>Thành công: {importResult.successCount ?? 0}</span>
              <span>Thất bại: {importResult.failureCount ?? 0}</span>
            </Space>

            {Array.isArray(importResult.successRecords) &&
              importResult.successRecords.length > 0 && (
                <div>
                  <Title level={5}>Bản ghi thành công</Title>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey={(r) => `${r.rowNumber}-${r.vin}`}
                    columns={[
                      { title: "Dòng", dataIndex: "rowNumber", width: 80 },
                      { title: "VIN", dataIndex: "vin" },
                      { title: "Số máy", dataIndex: "engineNumber" },
                      { title: "Model", dataIndex: "modelName" },
                      { title: "Màu", dataIndex: "colorName" },
                    ]}
                    dataSource={importResult.successRecords}
                  />
                </div>
              )}

            {Array.isArray(importResult.errorRecords) &&
              importResult.errorRecords.length > 0 && (
                <div>
                  <Title level={5} type="danger">
                    Bản ghi lỗi
                  </Title>
                  <Table
                    size="small"
                    pagination={false}
                    rowKey={(r) => `${r.rowNumber}-${r.vin}`}
                    columns={[
                      { title: "Dòng", dataIndex: "rowNumber", width: 80 },
                      { title: "VIN", dataIndex: "vin" },
                      { title: "Số máy", dataIndex: "engineNumber" },
                      {
                        title: "ModelColor ID",
                        dataIndex: "vehicleModelColorId",
                        width: 140,
                      },
                      { title: "Lỗi", dataIndex: "errorMessage" },
                    ]}
                    dataSource={importResult.errorRecords}
                  />
                </div>
              )}
          </Space>
        )}
      </Modal>

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
                  detailRecord?.status === "IN_STOCK" ||
                  detailRecord?.status === "AVAILABLE"
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
            <Descriptions.Item label="Đại lý">
              {detailRecord?.dealerName || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {detailRecord?.customerName || "-"}
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
