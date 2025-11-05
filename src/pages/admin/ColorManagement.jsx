import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Tag,
  Space,
  ColorPicker,
  Switch,
  Tooltip,
} from "antd";
import { useState, useEffect } from "react";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import api from "../../config/axios";

export default function ColorManagement() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [form] = Form.useForm();
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  // Chuẩn hóa/ngắn gọn thông báo lỗi từ BE
  const prettifyColorError = (rawMessage) => {
    if (!rawMessage) return "Có lỗi xảy ra, vui lòng thử lại.";
    const msg = String(rawMessage);
    if (msg.includes("Màu đang được gán vào mẫu xe")) {
      return "Không thể vô hiệu hóa vì màu đang được dùng trong mẫu xe. Vui lòng gỡ màu khỏi các mẫu xe trước.";
    }
    return msg;
  };

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

  // Xóa cứng không được hỗ trợ: hệ thống chỉ cho phép bật/tắt (soft delete)

  const handleDeactivateColor = async (colorId) => {
    try {
      const response = await api.patch(`colors/${colorId}/deactivate`);
      const statusOk = response?.status >= 200 && response?.status < 300;
      const hasSuccessFlag = Object.prototype.hasOwnProperty.call(
        response?.data || {},
        "success"
      );
      const success = hasSuccessFlag ? !!response.data.success : statusOk;
      const messageText = response?.data?.message;
      const code = response?.data?.code;
      return { success, message: messageText, code };
    } catch (error) {
      const messageText =
        error.response?.data?.message ||
        error.message ||
        "Failed to deactivate color";
      const code = error.response?.data?.code;
      return { success: false, message: messageText, code };
    }
  };

  const handleActivateColor = async (colorId) => {
    try {
      const response = await api.patch(`colors/${colorId}/activate`);
      const statusOk = response?.status >= 200 && response?.status < 300;
      const hasSuccessFlag = Object.prototype.hasOwnProperty.call(
        response?.data || {},
        "success"
      );
      const success = hasSuccessFlag ? !!response.data.success : statusOk;
      const messageText = response?.data?.message;
      const code = response?.data?.code;
      return { success, message: messageText, code };
    } catch (error) {
      const messageText =
        error.response?.data?.message ||
        error.message ||
        "Failed to activate color";
      const code = error.response?.data?.code;
      return { success: false, message: messageText, code };
    }
  };

  const handleToggleStatus = async (record, nextChecked) => {
    setStatusUpdatingId(record.id);
    // Optimistic UI
    setColors((prev) =>
      prev.map((c) =>
        c.id === record.id ? { ...c, isActive: nextChecked } : c
      )
    );

    const result = nextChecked
      ? await handleActivateColor(record.id)
      : await handleDeactivateColor(record.id);

    if (result.success) {
      messageApi.success(
        nextChecked
          ? "Kích hoạt màu thành công!"
          : "Vô hiệu hóa màu thành công!"
      );
      // ensure data consistent with BE
      await fetchColors();
    } else {
      // rollback
      setColors((prev) =>
        prev.map((c) =>
          c.id === record.id ? { ...c, isActive: !nextChecked } : c
        )
      );
      // Ưu tiên dùng code để viết message gọn nếu có
      const friendly =
        result.code === "COLOR_ASSIGNED_TO_MODEL"
          ? "Không thể vô hiệu hóa vì màu đang được dùng trong mẫu xe. Vui lòng gỡ màu khỏi các mẫu xe trước."
          : prettifyColorError(result.message);
      messageApi.error(friendly);
    }

    setStatusUpdatingId(null);
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
            loading={statusUpdatingId === record.id}
            onChange={(checked) => handleToggleStatus(record, checked)}
          />
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      {contextHolder}
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
