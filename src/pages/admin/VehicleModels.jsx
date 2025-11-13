import {
  Table,
  Button,
  message,
  Space,
  Card,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Tag,
  Tooltip,
  Descriptions,
  Spin,
  Image,
  Select,
} from "antd";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BgColorsOutlined,
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

export default function VehicleModels() {
  // Chuẩn hóa URL ảnh để chạy tốt ở dev qua proxy /api và cả prod
  const resolveImageUrl = (url) => {
    if (!url) return "";
    const s = String(url).trim();
    if (/^(data:|blob:|https?:\/\/)/i.test(s)) return s; // đã là URL tuyệt đối
    if (s.startsWith("/api/")) return s; // đã đi qua proxy
    if (s.startsWith("/")) return "/api" + s; // thêm prefix /api cho đường dẫn tuyệt đối
    return "/api/" + s.replace(/^\/+/, ""); // đường dẫn tương đối -> /api/<path>
  };
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  // Cache last known descriptions per model to workaround BE not returning description in response
  const [descriptionCache, setDescriptionCache] = useState({});
  const [messageApi, contextHolder] = message.useMessage();
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | inactive
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.get("vehicle-models");
      console.log("Vehicle Models API Response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setModels(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setModels(res.data.data);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setModels([]);
      }
    } catch (error) {
      console.error("Error fetching vehicle models:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load vehicle models";
      message.error(errorMessage);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Toggle status helper (reactive/inactive)
  const toggleModelStatus = async (modelId, enable) => {
    try {
      const url = enable
        ? `/vehicle-models/${modelId}/reactive`
        : `/vehicle-models/${modelId}/inactive`;
      const res = await api.patch(url);
      const statusOk = res?.status >= 200 && res?.status < 300;
      const hasFlag = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      );
      const success = hasFlag ? !!res.data.success : statusOk;
      return { success, message: res?.data?.message };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          "Thao tác thất bại",
      };
    }
  };

  const handleToggleStatus = async (record, nextChecked) => {
    const id = record.id;
    // set loading per row
    setStatusLoading((prev) => ({ ...prev, [id]: true }));
    // optimistic update
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isActive: nextChecked } : m))
    );
    const result = await toggleModelStatus(id, nextChecked);
    if (result.success) {
      messageApi.success(
        nextChecked
          ? "Kích hoạt model thành công!"
          : "Vô hiệu hóa model thành công!"
      );
      await fetchModels();
    } else {
      // rollback
      setModels((prev) =>
        prev.map((m) => (m.id === id ? { ...m, isActive: !nextChecked } : m))
      );
      messageApi.error(result.message);
    }
    setStatusLoading((prev) => ({ ...prev, [id]: false }));
  };

  // Load model detail by id from API and open modal
  const openDetail = async (record) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await api.get(`vehicle-models/${record.id}`);
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      const data = res?.data?.data || res?.data;
      if (success && data) {
        const desc =
          typeof data.description === "string" && data.description.length > 0
            ? data.description
            : descriptionCache[record.id] || "";
        setDetailRecord({
          ...data,
          description: desc,
          imageUrl: data?.imageUrl || record?.imageUrl || "",
        });
      } else {
        messageApi.error(res?.data?.message || "Không lấy được chi tiết model");
      }
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message ||
          err.message ||
          "Không lấy được chi tiết model"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Open edit modal and preload detail
  const openEdit = async (record) => {
    setEditingId(record.id);
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await api.get(`vehicle-models/${record.id}`);
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      const data = res?.data?.data || res?.data;
      if (success && data) {
        // Only set fields that are part of the update schema
        editForm.setFieldsValue({
          name: data.name ?? "",
          modelCode: data.modelCode ?? "",
          description: data.description ?? "",
          brand: data.brand ?? "",
          year: data.year ?? undefined,
          batteryCapacity: data.batteryCapacity ?? undefined,
          rangeKm: data.rangeKm ?? undefined,
          chargingTime: data.chargingTime ?? undefined,
          maxSpeed: data.maxSpeed ?? undefined,
          acceleration: data.acceleration ?? undefined,
          seatingCapacity: data.seatingCapacity ?? undefined,
          cargoVolume: data.cargoVolume ?? undefined,
          manufacturerPrice: data.manufacturerPrice ?? undefined,
          imageUrl: data.imageUrl ?? "",
        });
      } else {
        messageApi.error(
          res?.data?.message || "Không lấy được chi tiết model để cập nhật"
        );
        setEditOpen(false);
      }
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message ||
          err.message ||
          "Không lấy được chi tiết model để cập nhật"
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateModel = async (values) => {
    if (!editingId) return;
    setEditLoading(true);
    try {
      // Build payload exactly as API schema
      const payload = {
        name: values.name,
        modelCode: values.modelCode,
        description: values.description,
        brand: values.brand,
        year: Number(values.year),
        batteryCapacity: Number(values.batteryCapacity),
        rangeKm: Number(values.rangeKm),
        chargingTime: Number(values.chargingTime),
        maxSpeed: Number(values.maxSpeed),
        acceleration: Number(values.acceleration),
        seatingCapacity: Number(values.seatingCapacity),
        cargoVolume: Number(values.cargoVolume),
        manufacturerPrice: Number(values.manufacturerPrice),
        imageUrl: values.imageUrl,
      };

      const res = await api.put(`vehicle-models/${editingId}`, payload);
      const ok = res?.status >= 200 && res?.status < 300;
      const success = Object.prototype.hasOwnProperty.call(
        res?.data || {},
        "success"
      )
        ? !!res.data.success
        : ok;
      if (success) {
        messageApi.success("Cập nhật model thành công!");
        // Optimistically update table data
        setModels((prev) =>
          (prev || []).map((m) =>
            m.id === editingId ? { ...m, ...payload } : m
          )
        );
        // If detail modal is open for the same model, update it too
        setDetailRecord((prev) =>
          prev && prev.id === editingId ? { ...prev, ...payload } : prev
        );
        // Cache description for detail view because BE response doesn't include it
        setDescriptionCache((prev) => ({
          ...prev,
          [editingId]: payload.description || "",
        }));

        setEditOpen(false);
        setEditingId(null);
        editForm.resetFields();
        // Refresh from server to ensure consistency
        await fetchModels();
      } else {
        messageApi.error(res?.data?.message || "Cập nhật model thất bại!");
      }
    } catch (err) {
      messageApi.error(
        err?.response?.data?.message ||
          err.message ||
          "Cập nhật model thất bại!"
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleCreateModel = async (values) => {
    setCreateLoading(true);
    try {
      const res = await api.post("/vehicle-models/create", values);
      console.log("Create model response:", res.data);

      if (res.data && res.data.success) {
        message.success("Tạo model mới thành công!");
        setCreateModalVisible(false);
        form.resetFields();
        fetchModels(); // Reload list
      } else {
        message.error(res.data?.message || "Tạo model thất bại!");
      }
    } catch (error) {
      console.error("Error creating model:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi tạo model!";
      message.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  // Note: legacy activate/deactivate handlers removed after switching to Switch toggle.

  const navigateToModelColors = (modelId) => {
    navigate(`/manufacturer/vehicle-models/${modelId}/colors`);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
    },
    {
      title: "Tên Model",
      dataIndex: "name",
    },
    {
      title: "Mã Model",
      dataIndex: "modelCode",
    },
    {
      title: "Giá nhà sản xuất",
      dataIndex: "manufacturerPrice",
      render: (_, record) => {
        const price = record?.manufacturerPrice ?? record?.basePrice;
        return (
          <span className="font-medium">
            {price ? price.toLocaleString() : ""} VND
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Tag
            style={
              isActive
                ? {
                    backgroundColor: "#f6ffed",
                    color: "#389e0d",
                    borderColor: "#b7eb8f",
                  }
                : {
                    backgroundColor: "#fff1f0",
                    color: "#cf1322",
                    borderColor: "#ffa39e",
                  }
            }
          >
            {isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </Tag>
          <Switch
            checked={!!isActive}
            loading={!!statusLoading[record.id]}
            onChange={(checked) => handleToggleStatus(record, checked)}
          />
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Quản lý màu sắc">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<BgColorsOutlined />}
              onClick={() => navigateToModelColors(record.id)}
            />
          </Tooltip>
          <Tooltip title="Cập nhật">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => openDetail(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Quản lý Vehicle Models</h2>
            <p className="text-gray-600 mt-1">
              Quản lý các model xe và màu sắc tương ứng
            </p>
          </div>
          <Space size={8}>
            <Input.Search
              placeholder="Tìm theo tên model"
              allowClear
              onChange={(e) => setSearchName(e.target.value)}
              style={{ width: 240 }}
            />
            <Select
              value={statusFilter}
              style={{ width: 160 }}
              onChange={setStatusFilter}
              options={[
                { label: "Tất cả trạng thái", value: "all" },
                { label: "Hoạt động", value: "active" },
                { label: "Vô hiệu hóa", value: "inactive" },
              ]}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo Model Mới
            </Button>
          </Space>
        </div>
      </Card>

      <Table
        dataSource={useMemo(() => {
          const name = searchName.trim().toLowerCase();
          return (models || []).filter((m) => {
            const matchName =
              !name || (m.name || "").toLowerCase().includes(name);
            const matchStatus =
              statusFilter === "all" ||
              (statusFilter === "active" && m.isActive) ||
              (statusFilter === "inactive" && !m.isActive);
            return matchName && matchStatus;
          });
        }, [models, searchName, statusFilter])}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} models`,
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      {/* Create Model Modal */}
      <Modal
        title="Tạo Model Xe Mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateModel}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Tên Model"
              name="name"
              rules={[{ required: true, message: "Vui lòng nhập tên model!" }]}
            >
              <Input placeholder="VF 8, VF 9..." />
            </Form.Item>

            <Form.Item
              label="Mã Model"
              name="modelCode"
              rules={[{ required: true, message: "Vui lòng nhập mã model!" }]}
            >
              <Input placeholder="VF8-001, VF9-002..." />
            </Form.Item>

            <Form.Item
              label="Thương hiệu"
              name="brand"
              rules={[
                { required: true, message: "Vui lòng nhập thương hiệu!" },
              ]}
            >
              <Input placeholder="VinFast, Tesla..." />
            </Form.Item>

            <Form.Item
              label="Năm sản xuất"
              name="year"
              rules={[
                { required: true, message: "Vui lòng nhập năm sản xuất!" },
              ]}
            >
              <InputNumber
                min={2000}
                max={2030}
                className="w-full"
                placeholder="2024"
              />
            </Form.Item>

            <Form.Item
              label="Dung lượng pin (kWh)"
              name="batteryCapacity"
              rules={[
                { required: true, message: "Vui lòng nhập dung lượng pin!" },
              ]}
            >
              <InputNumber min={0} className="w-full" placeholder="87.7" />
            </Form.Item>

            <Form.Item
              label="Phạm vi hoạt động (km)"
              name="rangeKm"
              rules={[
                { required: true, message: "Vui lòng nhập phạm vi hoạt động!" },
              ]}
            >
              <InputNumber min={0} className="w-full" placeholder="420" />
            </Form.Item>

            <Form.Item
              label="Thời gian sạc (phút)"
              name="chargingTime"
              rules={[
                { required: true, message: "Vui lòng nhập thời gian sạc!" },
              ]}
            >
              <InputNumber min={0} className="w-full" placeholder="31" />
            </Form.Item>

            <Form.Item
              label="Tốc độ tối đa (km/h)"
              name="maxSpeed"
              rules={[
                { required: true, message: "Vui lòng nhập tốc độ tối đa!" },
              ]}
            >
              <InputNumber min={0} className="w-full" placeholder="200" />
            </Form.Item>

            <Form.Item
              label="Gia tốc 0-100km/h (giây)"
              name="acceleration"
              rules={[{ required: true, message: "Vui lòng nhập gia tốc!" }]}
            >
              <InputNumber
                min={0}
                step={0.1}
                className="w-full"
                placeholder="5.3"
              />
            </Form.Item>

            <Form.Item
              label="Số chỗ ngồi"
              name="seatingCapacity"
              rules={[
                { required: true, message: "Vui lòng nhập số chỗ ngồi!" },
              ]}
            >
              <InputNumber
                min={1}
                max={10}
                className="w-full"
                placeholder="7"
              />
            </Form.Item>

            <Form.Item
              label="Dung tích cốp (lít)"
              name="cargoVolume"
              rules={[
                { required: true, message: "Vui lòng nhập dung tích cốp!" },
              ]}
            >
              <InputNumber min={0} className="w-full" placeholder="376" />
            </Form.Item>

            <Form.Item
              label="Giá nhà sản xuất (VND)"
              name="manufacturerPrice"
              rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
            >
              <InputNumber
                min={1}
                className="w-full"
                placeholder="1200000000"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết về model xe..."
            />
          </Form.Item>

          <Form.Item
            label="URL hình ảnh"
            name="imageUrl"
            rules={[
              { required: true, message: "Vui lòng nhập URL hình ảnh!" },
              { type: "url", message: "Vui lòng nhập URL hợp lệ!" },
            ]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>
              Tạo Model
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Model Modal */}
      <Modal
        title="Cập nhật Model"
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditingId(null);
          editForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        {editLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : (
          <Form form={editForm} layout="vertical" onFinish={handleUpdateModel}>
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label="Tên Model"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên model!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Mã Model"
                name="modelCode"
                rules={[{ required: true, message: "Vui lòng nhập mã model!" }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Thương hiệu"
                name="brand"
                rules={[
                  { required: true, message: "Vui lòng nhập thương hiệu!" },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Năm sản xuất"
                name="year"
                rules={[
                  { required: true, message: "Vui lòng nhập năm sản xuất!" },
                ]}
              >
                <InputNumber min={2000} max={2030} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Dung lượng pin (kWh)"
                name="batteryCapacity"
                rules={[
                  { required: true, message: "Vui lòng nhập dung lượng pin!" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Phạm vi hoạt động (km)"
                name="rangeKm"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập phạm vi hoạt động!",
                  },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Thời gian sạc (phút)"
                name="chargingTime"
                rules={[
                  { required: true, message: "Vui lòng nhập thời gian sạc!" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Tốc độ tối đa (km/h)"
                name="maxSpeed"
                rules={[
                  { required: true, message: "Vui lòng nhập tốc độ tối đa!" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Gia tốc 0-100km/h (giây)"
                name="acceleration"
                rules={[{ required: true, message: "Vui lòng nhập gia tốc!" }]}
              >
                <InputNumber min={0} step={0.1} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Số chỗ ngồi"
                name="seatingCapacity"
                rules={[
                  { required: true, message: "Vui lòng nhập số chỗ ngồi!" },
                ]}
              >
                <InputNumber min={1} max={10} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Dung tích cốp (lít)"
                name="cargoVolume"
                rules={[
                  { required: true, message: "Vui lòng nhập dung tích cốp!" },
                ]}
              >
                <InputNumber min={0} className="w-full" />
              </Form.Item>
              <Form.Item
                label="Giá nhà sản xuất (VND)"
                name="manufacturerPrice"
                rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
              >
                <InputNumber
                  min={1}
                  className="w-full"
                  formatter={(v) =>
                    `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(v) => v.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </div>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              label="URL hình ảnh"
              name="imageUrl"
              rules={[
                { required: true, message: "Vui lòng nhập URL hình ảnh!" },
                { type: "url", message: "Vui lòng nhập URL hợp lệ!" },
              ]}
            >
              <Input />
            </Form.Item>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                onClick={() => {
                  setEditOpen(false);
                  setEditingId(null);
                  editForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Cập nhật
              </Button>
            </div>
          </Form>
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết Model"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {detailLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin />
          </div>
        ) : (
          detailRecord && (
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="ID">
                {detailRecord.id}
              </Descriptions.Item>
              <Descriptions.Item label="Tên Model">
                {detailRecord.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã Model">
                {detailRecord.modelCode}
              </Descriptions.Item>
              <Descriptions.Item label="Thương hiệu">
                {detailRecord.brand}
              </Descriptions.Item>
              <Descriptions.Item label="Năm">
                {detailRecord.year}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {detailRecord.isActive ? "Hoạt động" : "Vô hiệu hóa"}
              </Descriptions.Item>
              <Descriptions.Item label="Pin (kWh)">
                {detailRecord.batteryCapacity}
              </Descriptions.Item>
              <Descriptions.Item label="Tầm hoạt động (km)">
                {detailRecord.rangeKm}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian sạc (phút)">
                {detailRecord.chargingTime}
              </Descriptions.Item>
              <Descriptions.Item label="Tốc độ tối đa (km/h)">
                {detailRecord.maxSpeed}
              </Descriptions.Item>
              <Descriptions.Item label="0-100 km/h (s)">
                {detailRecord.acceleration}
              </Descriptions.Item>
              <Descriptions.Item label="Số chỗ ngồi">
                {detailRecord.seatingCapacity}
              </Descriptions.Item>
              <Descriptions.Item label="Dung tích cốp (l)">
                {detailRecord.cargoVolume}
              </Descriptions.Item>
              <Descriptions.Item label="Giá NSX (VND)" span={2}>
                {detailRecord.manufacturerPrice?.toLocaleString()} VND
              </Descriptions.Item>
              {/* Với column={2}, mỗi hàng phải có tổng span = 2. Dùng span={2} để mô tả chiếm full width */}
              <Descriptions.Item label="Mô tả" span={2}>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {detailRecord?.description &&
                  detailRecord.description.trim() !== ""
                    ? detailRecord.description
                    : "Chưa có mô tả"}
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Hình ảnh" span={2}>
                {detailRecord.imageUrl ? (
                  <Image
                    src={resolveImageUrl(detailRecord.imageUrl)}
                    alt={detailRecord.name}
                    width={320}
                    fallback="https://via.placeholder.com/320x180?text=No+Image"
                    onError={(e) => {
                      const img = e?.currentTarget;
                      if (
                        img &&
                        img.src !== img.getAttribute("data-fallback")
                      ) {
                        img.setAttribute(
                          "data-fallback",
                          "https://via.placeholder.com/320x180?text=No+Image"
                        );
                        img.src =
                          "https://via.placeholder.com/320x180?text=No+Image";
                      }
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 320,
                      height: 180,
                      border: "1px dashed #d9d9d9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#999",
                    }}
                  >
                    Chưa có hình ảnh
                  </div>
                )}
              </Descriptions.Item>
            </Descriptions>
          )
        )}
      </Modal>
    </div>
  );
}
