// src/pages/dealer/colorManagement.jsx
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Popconfirm,
  Spin,
  Row,
  Col,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";
import toast from "react-hot-toast";

export default function ColorManagement() {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState(null);
  const [form] = Form.useForm();

  // Fetch all colors
  const fetchColors = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/api/colors");
      if (response.data.success) {
        setColors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching colors:", error);
      // Mock data for development
      setColors([
        {
          id: 1,
          colorName: "Pearl White",
          hexCode: "#FFFFFF",
          isActive: true,
        },
        {
          id: 2,
          colorName: "Midnight Silver",
          hexCode: "#2C2C2C",
          isActive: true,
        },
        {
          id: 3,
          colorName: "Deep Blue",
          hexCode: "#1E3A8A",
          isActive: true,
        },
        {
          id: 4,
          colorName: "Red Metallic",
          hexCode: "#DC2626",
          isActive: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // CRUD Functions
  const openModal = (color = null) => {
    setEditingColor(color);
    if (color) {
      form.setFieldsValue(color);
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingColor) {
        // Update color
        const response = await apiClient.put(
          `/api/colors/${editingColor.id}`,
          values
        );
        if (response.data.success) {
          toast.success("Color updated successfully!", {
            position: "top-right",
            duration: 3000,
          });
          fetchColors();
        } else {
          toast.error(response.data.message || "Failed to update color!", {
            position: "top-right",
            duration: 3000,
          });
        }
      } else {
        // Create color
        const response = await apiClient.post("/api/colors/create", values);
        if (response.data.success) {
          toast.success("Color created successfully!", {
            position: "top-right",
            duration: 3000,
          });
          fetchColors();
        } else {
          toast.error(response.data.message || "Failed to create color!", {
            position: "top-right",
            duration: 3000,
          });
        }
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving color:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to save color!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await apiClient.delete(`/api/colors/${id}`);
      if (response.data.success) {
        toast.success("Color deleted successfully!", {
          position: "top-right",
          duration: 3000,
        });
        fetchColors();
      } else {
        toast.error(response.data.message || "Failed to delete color!", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error deleting color:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to delete color!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const endpoint = currentStatus
        ? `/api/colors/${id}/inactive`
        : `/api/colors/${id}/reactive`;
      const response = await apiClient.put(endpoint);

      if (response.data.success) {
        toast.success(
          `Color ${currentStatus ? "deactivated" : "activated"} successfully!`,
          {
            position: "top-right",
            duration: 3000,
          }
        );
        fetchColors();
      } else {
        toast.error(response.data.message || "Failed to update color status!", {
          position: "top-right",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error toggling color status:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        toast.error("Failed to update color status!", {
          position: "top-right",
          duration: 3000,
        });
      }
    }
  };

  const columns = [
    {
      title: "Color",
      dataIndex: "colorName",
      key: "colorName",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: record.hexCode }}
          ></div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Hex Code",
      dataIndex: "hexCode",
      key: "hexCode",
      render: (hex) => (
        <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
          {hex}
        </code>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag
          color={isActive ? "green" : "red"}
          icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
        >
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => openModal(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            type={record.isActive ? "default" : "primary"}
            size="small"
            onClick={() => handleToggleStatus(record.id, record.isActive)}
            icon={record.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
          >
            {record.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this color?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
      align: "center",
    },
  ];

  return (
    <DealerLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                🎨 Color Management
              </h2>
              <p className="text-gray-600">
                Manage vehicle colors and their availability
              </p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Add Color
            </Button>
          </div>
        </div>

        <Card>
          <Spin spinning={loading}>
            <Table
              dataSource={colors}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 600 }}
            />
          </Spin>
        </Card>

        {/* Color Modal */}
        <Modal
          title={editingColor ? "Edit Color" : "Add New Color"}
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          onOk={handleSubmit}
          okText="Save"
          cancelText="Cancel"
          width={500}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              isActive: true,
            }}
          >
            <Form.Item
              name="colorName"
              label="Color Name"
              rules={[
                { required: true, message: "Please enter color name!" },
                {
                  min: 2,
                  message: "Color name must be at least 2 characters!",
                },
              ]}
            >
              <Input placeholder="e.g., Pearl White" />
            </Form.Item>

            <Form.Item
              name="hexCode"
              label="Hex Code"
              rules={[
                { required: true, message: "Please enter hex code!" },
                {
                  pattern: /^#([A-Fa-f0-9]{6})$/,
                  message: "Please enter valid hex code (e.g., #FFFFFF)!",
                },
              ]}
            >
              <Input placeholder="#FFFFFF" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  valuePropName="checked"
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked />
                    <span>Active</span>
                  </div>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
