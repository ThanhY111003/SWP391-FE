import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Select,
  InputNumber,
  Card,
  Breadcrumb,
  Tooltip,
} from "antd";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

export default function VehicleModelColors() {
  const { modelId } = useParams();
  const navigate = useNavigate();

  const [modelColors, setModelColors] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingModelColor, setEditingModelColor] = useState(null);
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchModelColors = async () => {
    if (!modelId) return;

    setLoading(true);
    try {
      const res = await api.get(`vehicle-models/${modelId}/colors`);
      console.log("Model Colors API Response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setModelColors(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setModelColors(res.data.data);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setModelColors([]);
      }
    } catch (error) {
      console.error("Error fetching model colors:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load model colors";
      message.error(errorMessage);
      setModelColors([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableColors = async () => {
    try {
      const res = await api.get("colors");
      console.log("Available Colors API Response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setAvailableColors(res.data.filter((color) => color.isActive));
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setAvailableColors(res.data.data.filter((color) => color.isActive));
      } else {
        setAvailableColors([]);
      }
    } catch (error) {
      console.error("Error fetching available colors:", error);
      setAvailableColors([]);
    }
  };

  const fetchModelInfo = async () => {
    if (!modelId) return;

    try {
      const res = await api.get(`vehicle-models/${modelId}`);
      console.log("Model Info API Response:", res.data);

      if (res.data?.data) {
        setModelInfo(res.data.data);
      } else if (res.data) {
        setModelInfo(res.data);
      }
    } catch (error) {
      console.error("Error fetching model info:", error);
      setModelInfo({ name: `Model ${modelId}` }); // Fallback
    }
  };

  const handleAddColorToModel = async (values) => {
    try {
      console.log("Adding color to model:", modelId, values);
      const response = await api.post(
        `vehicle-models/${modelId}/colors`,
        null,
        {
          params: {
            colorId: values.colorId,
            priceAdjustment: values.priceAdjustment || 0,
          },
        }
      );

      if (response.data?.success) {
        messageApi.success("Thêm màu cho model thành công!");
        form.resetFields();
        setOpen(false);
        setEditingModelColor(null);
        fetchModelColors();
      } else {
        throw new Error(
          response.data?.message || "Failed to add color to model"
        );
      }
    } catch (error) {
      console.error("Error adding color to model:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to add color to model";
      messageApi.error(errorMessage);
    }
  };

  const handleUpdateModelColor = async (values) => {
    try {
      console.log("Updating model color:", editingModelColor, values);

      const payload = {
        priceAdjustment: Number(values.priceAdjustment ?? 0),
      };

      const response = await api.patch(
        `vehicle-models/${modelId}/colors/${editingModelColor.colorId}`,
        payload
      );

      if (response.data?.success) {
        messageApi.success("Cập nhật phần chênh lệch giá thành công!");
        const updated = response?.data?.data;
        const nextPrice =
          typeof updated?.priceAdjustment === "number"
            ? updated.priceAdjustment
            : payload.priceAdjustment;
        // Optimistic update local state
        setModelColors((prev) =>
          (prev || []).map((mc) =>
            mc.colorId === editingModelColor.colorId
              ? { ...mc, priceAdjustment: nextPrice }
              : mc
          )
        );
        form.resetFields();
        setOpen(false);
        setEditingModelColor(null);
        // Optionally refresh to ensure consistency
        fetchModelColors();
      } else {
        throw new Error(
          response.data?.message || "Failed to update model color"
        );
      }
    } catch (error) {
      console.error("Error updating model color:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update model color";
      messageApi.error(errorMessage);
    }
  };

  const handleDeleteModelColor = async (modelColor) => {
    try {
      // Optimistic remove
      const snapshot = modelColors;
      setModelColors((prev) =>
        (prev || []).filter((mc) => mc.colorId !== modelColor.colorId)
      );

      // Sử dụng colorId thay vì id của record
      const response = await api.delete(
        `vehicle-models/${modelId}/colors/${modelColor.colorId}`
      );

      if (response.data?.success) {
        messageApi.success("Xóa màu khỏi model thành công!");
        // Optionally refresh
        fetchModelColors();
      } else {
        // rollback
        setModelColors(snapshot);
        throw new Error(
          response.data?.message || "Failed to delete model color"
        );
      }
    } catch (error) {
      console.error("Error deleting model color:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete model color";
      messageApi.error(errorMessage);
    }
  };

  // No toggle status API for model colors; status column removed per request

  const openCreateModal = () => {
    setEditingModelColor(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (modelColor) => {
    setEditingModelColor(modelColor);
    form.setFieldsValue({
      colorId: modelColor.colorId,
      priceAdjustment: modelColor.priceAdjustment,
    });
    setOpen(true);
  };

  const handleFormSubmit = (values) => {
    if (editingModelColor) {
      handleUpdateModelColor(values);
    } else {
      handleAddColorToModel(values);
    }
  };

  useEffect(() => {
    if (modelId) {
      fetchModelColors();
      fetchAvailableColors();
      fetchModelInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelId]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Màu",
      dataIndex: "colorName",
      render: (colorName, record) => (
        <Space>
          <div
            style={{
              width: 30,
              height: 30,
              backgroundColor: record.hexCode,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
          <div>
            <div className="font-medium">{colorName}</div>
            <div className="text-gray-500 text-sm">{record.hexCode}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Điều chỉnh giá",
      dataIndex: "priceAdjustment",
      render: (priceAdjustment) => (
        <span
          className={
            priceAdjustment > 0
              ? "text-green-600"
              : priceAdjustment < 0
              ? "text-red-600"
              : ""
          }
        >
          {priceAdjustment > 0 ? "+" : ""}
          {priceAdjustment?.toLocaleString()} VND
        </span>
      ),
      sorter: (a, b) => a.priceAdjustment - b.priceAdjustment,
    },
    {
      title: "Vehicle Model ID",
      dataIndex: "vehicleModelId",
      width: 120,
    },
    // Trạng thái tạm thời không hiển thị vì chưa có API bật/tắt
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa chênh lệch giá">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa màu khỏi model"
            description="Bạn có chắc chắn muốn xóa màu này khỏi model?"
            onConfirm={() => handleDeleteModelColor(record)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa màu khỏi model">
              <Button
                type="text"
                danger
                size="small"
                shape="circle"
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <div>
              <Breadcrumb
                items={[
                  { title: "Quản lý xe" },
                  { title: "Models" },
                  { title: modelInfo?.name || `Model ${modelId}` },
                  { title: "Màu sắc" },
                ]}
              />
              <h2 className="text-xl font-bold mt-2">
                Quản lý màu sắc - {modelInfo?.name || `Model ${modelId}`}
              </h2>
            </div>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Thêm màu cho model
          </Button>
        </div>
      </Card>

      {contextHolder}
      <Table
        dataSource={modelColors || []}
        columns={columns}
        rowKey={(r) => r?.id ?? `${r?.vehicleModelId}-${r?.colorId}`}
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} màu`,
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      <Modal
        open={open}
        title={editingModelColor ? "Chỉnh sửa màu model" : "Thêm màu cho model"}
        onCancel={() => {
          setOpen(false);
          setEditingModelColor(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            priceAdjustment: 0,
          }}
        >
          {!editingModelColor ? (
            <Form.Item
              name="colorId"
              label="Chọn màu"
              rules={[{ required: true, message: "Vui lòng chọn màu!" }]}
            >
              <Select
                placeholder="Chọn màu từ danh sách"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={(availableColors || [])
                  .filter(
                    (color) =>
                      !(modelColors || []).some((mc) => mc.colorId === color.id)
                  )
                  .map((color) => ({
                    value: color.id,
                    label: (
                      <Space>
                        <div
                          style={{
                            width: 20,
                            height: 20,
                            backgroundColor: color.hexCode,
                            border: "1px solid #d9d9d9",
                            borderRadius: 2,
                          }}
                        />
                        {color.colorName} ({color.hexCode})
                      </Space>
                    ),
                  }))}
              />
            </Form.Item>
          ) : (
            <Form.Item label="Màu hiện tại">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: editingModelColor.hexCode,
                    border: "1px solid #d9d9d9",
                    borderRadius: 4,
                  }}
                />
                <div>
                  <div className="font-medium">
                    {editingModelColor.colorName}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {editingModelColor.hexCode}
                  </div>
                </div>
              </div>
            </Form.Item>
          )}

          <Form.Item
            name="priceAdjustment"
            label={
              editingModelColor
                ? "Phần chênh lệch giá mới (VND)"
                : "Điều chỉnh giá (VND)"
            }
            rules={[{ type: "number", message: "Phải là số!" }]}
            tooltip={
              editingModelColor
                ? "Nhập phần chênh lệch giá mới để cập nhật"
                : "Số tiền tăng/giảm so với giá gốc. Để 0 nếu không thay đổi."
            }
          >
            <InputNumber
              className="w-full"
              placeholder="0"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => {
                setOpen(false);
                setEditingModelColor(null);
                form.resetFields();
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="flex-1">
              {editingModelColor ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
