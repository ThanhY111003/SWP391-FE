import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  Popconfirm,
  ColorPicker,
} from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../../config/axios";

export default function ColorManagement() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [form] = Form.useForm();

  const fetchColors = async () => {
    setLoading(true);
    try {
      const res = await api.get("colors");
      console.log("Colors API Response:", res.data);

      if (res.data && Array.isArray(res.data)) {
        setColors(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setColors(res.data.data);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setColors([]);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load colors";
      message.error(errorMessage);
      setColors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateColor = async (values) => {
    try {
      const colorData = {
        colorName: values.colorName,
        hexCode: values.hexCode,
      };

      console.log("Creating color:", colorData);

      const response = await api.post("colors", colorData);

      if (response.data?.success) {
        message.success("Tạo màu mới thành công!");
        form.resetFields();
        setOpen(false);
        setEditingColor(null);
        fetchColors();
      } else {
        throw new Error(response.data?.message || "Failed to create color");
      }
    } catch (error) {
      console.error("Error creating color:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create color";
      message.error(errorMessage);
    }
  };

  const handleUpdateColor = async (values) => {
    try {
      const colorData = {
        colorName: values.colorName,
        hexCode: values.hexCode,
      };

      console.log("Updating color:", editingColor.id, colorData);

      const response = await api.put(`colors/${editingColor.id}`, colorData);

      if (response.data?.success) {
        message.success("Cập nhật màu thành công!");
        form.resetFields();
        setOpen(false);
        setEditingColor(null);
        fetchColors();
      } else {
        throw new Error(response.data?.message || "Failed to update color");
      }
    } catch (error) {
      console.error("Error updating color:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update color";
      message.error(errorMessage);
    }
  };

  const handleDeleteColor = async (colorId) => {
    try {
      const response = await api.delete(`colors/${colorId}`);

      if (response.data?.success) {
        message.success("Xóa màu thành công!");
        fetchColors();
      } else {
        throw new Error(response.data?.message || "Failed to delete color");
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to delete color";
      message.error(errorMessage);
    }
  };

  const handleDeactivateColor = async (colorId) => {
    try {
      console.log("Deactivating color with ID:", colorId);

      const response = await api.patch(`colors/${colorId}/deactivate`);

      console.log("Deactivate response:", response.data);

      if (response.data?.success) {
        message.success("Vô hiệu hóa màu thành công!");
        fetchColors();
      } else {
        throw new Error(response.data?.message || "Failed to deactivate color");
      }
    } catch (error) {
      console.error("Error deactivating color:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to deactivate color";
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleActivateColor = async (colorId) => {
    try {
      console.log("Activating color with ID:", colorId);

      // Giả sử có API activate tương tự
      const response = await api.patch(`colors/${colorId}/activate`);

      console.log("Activate response:", response.data);

      if (response.data?.success) {
        message.success("Kích hoạt màu thành công!");
        fetchColors();
      } else {
        throw new Error(response.data?.message || "Failed to activate color");
      }
    } catch (error) {
      console.error("Error activating color:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to activate color";
      message.error(`Lỗi: ${errorMessage}`);
    }
  };

  const openCreateModal = () => {
    setEditingColor(null);
    form.resetFields();
    setOpen(true);
  };

  const openEditModal = (color) => {
    setEditingColor(color);
    form.setFieldsValue({
      colorName: color.colorName,
      hexCode: color.hexCode,
    });
    setOpen(true);
  };

  const handleFormSubmit = (values) => {
    if (editingColor) {
      handleUpdateColor(values);
    } else {
      handleCreateColor(values);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tên màu",
      dataIndex: "colorName",
      sorter: (a, b) => a.colorName.localeCompare(b.colorName),
    },
    {
      title: "Mã màu",
      dataIndex: "hexCode",
      render: (hexCode) => (
        <Space>
          <div
            style={{
              width: 30,
              height: 30,
              backgroundColor: hexCode,
              border: "1px solid #d9d9d9",
              borderRadius: 4,
            }}
          />
          <span className="font-mono">{hexCode}</span>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive, record) => (
        <Space direction="vertical" size="small">
          <Tag color={isActive ? "green" : "red"}>
            {isActive ? "Hoạt động" : "Vô hiệu hóa"}
          </Tag>
          <Space>
            {isActive ? (
              <Button
                size="small"
                danger
                onClick={() => handleDeactivateColor(record.id)}
              >
                Vô hiệu hóa
              </Button>
            ) : (
              <Button
                size="small"
                type="primary"
                onClick={() => handleActivateColor(record.id)}
              >
                Kích hoạt
              </Button>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa màu"
            description="Bạn có chắc chắn muốn xóa màu này?"
            onConfirm={() => handleDeleteColor(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý màu sắc xe</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateModal}
        >
          Tạo màu mới
        </Button>
      </div>

      <Table
        dataSource={colors || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} màu`,
        }}
        scroll={{ x: 800 }}
        size="middle"
      />

      <Modal
        open={open}
        title={editingColor ? "Chỉnh sửa màu" : "Tạo màu mới"}
        onCancel={() => {
          setOpen(false);
          setEditingColor(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            hexCode: "#000000",
          }}
        >
          <Form.Item
            name="colorName"
            label="Tên màu"
            rules={[
              { required: true, message: "Vui lòng nhập tên màu!" },
              { min: 1, max: 50, message: "Tên màu phải từ 1-50 ký tự!" },
            ]}
          >
            <Input placeholder="Ví dụ: Đỏ, Xanh dương, Trắng ngọc trai..." />
          </Form.Item>

          <Form.Item
            name="hexCode"
            label="Mã màu (Hex)"
            rules={[
              { required: true, message: "Vui lòng chọn mã màu!" },
              {
                pattern: /^#[0-9A-Fa-f]{6}$/,
                message: "Mã màu phải có định dạng #RRGGBB (ví dụ: #FF0000)",
              },
            ]}
          >
            <Input
              placeholder="#000000"
              addonBefore={
                <Form.Item
                  name="colorPicker"
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.hexCode !== currentValues.hexCode
                  }
                >
                  {({ getFieldValue }) => (
                    <ColorPicker
                      value={getFieldValue("hexCode")}
                      onChange={(color) => {
                        const hexValue = color.toHexString();
                        form.setFieldValue("hexCode", hexValue);
                      }}
                      showText={false}
                      size="small"
                    />
                  )}
                </Form.Item>
              }
              onChange={(e) => {
                const value = e.target.value;
                // Auto-add # if missing
                if (value && !value.startsWith("#")) {
                  form.setFieldValue("hexCode", "#" + value);
                }
              }}
            />
          </Form.Item>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => {
                setOpen(false);
                setEditingColor(null);
                form.resetFields();
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" className="flex-1">
              {editingColor ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
