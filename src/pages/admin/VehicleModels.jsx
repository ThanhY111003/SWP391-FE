import { Table, Button, message, Space, Card, Modal, Form, Input, InputNumber, Popconfirm } from "antd";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BgColorsOutlined, PlusOutlined, StopOutlined, PlayCircleOutlined } from "@ant-design/icons";
import api from "../../config/axios";

export default function VehicleModels() {
  const navigate = useNavigate();
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
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

  const handleInactiveModel = async (modelId) => {
    setStatusLoading(prev => ({ ...prev, [modelId]: true }));
    try {
      const res = await api.patch(`/vehicle-models/${modelId}/inactive`);
      console.log("Inactive model response:", res.data);

      if (res.data && res.data.success) {
        message.success("Vô hiệu hóa model thành công!");
        fetchModels(); // Reload list
      } else {
        message.error(res.data?.message || "Vô hiệu hóa model thất bại!");
      }
    } catch (error) {
      console.error("Error inactivating model:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi vô hiệu hóa model!";
      message.error(errorMessage);
    } finally {
      setStatusLoading(prev => ({ ...prev, [modelId]: false }));
    }
  };

  const handleActiveModel = async (modelId) => {
    setStatusLoading(prev => ({ ...prev, [modelId]: true }));
    try {
      const res = await api.patch(`/vehicle-models/${modelId}/reactive`);
      console.log("Reactive model response:", res.data);

      if (res.data && res.data.success) {
        message.success("Kích hoạt model thành công!");
        fetchModels(); // Reload list
      } else {
        message.error(res.data?.message || "Kích hoạt model thất bại!");
      }
    } catch (error) {
      console.error("Error reactivating model:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi kích hoạt model!";
      message.error(errorMessage);
    } finally {
      setStatusLoading(prev => ({ ...prev, [modelId]: false }));
    }
  };

  const navigateToModelColors = (modelId) => {
    navigate(`/manufacturer/vehicle-models/${modelId}/colors`);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Tên Model",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      render: (description) => (
        <span className="text-gray-600">{description || "Chưa có mô tả"}</span>
      ),
    },
    {
      title: "Giá cơ bản",
      dataIndex: "basePrice",
      render: (basePrice) => (
        <span className="font-medium">{basePrice?.toLocaleString()} VND</span>
      ),
      sorter: (a, b) => (a.basePrice || 0) - (b.basePrice || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      render: (isActive) => (
        <span
          className={`px-2 py-1 rounded text-sm ${
            isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {isActive ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Không hoạt động", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 280,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<BgColorsOutlined />}
            onClick={() => navigateToModelColors(record.id)}
          >
            Quản lý màu sắc
          </Button>
          
          {record.isActive ? (
            <Popconfirm
              title="Vô hiệu hóa model"
              description="Bạn có chắc chắn muốn vô hiệu hóa model này?"
              onConfirm={() => handleInactiveModel(record.id)}
              okText="Vô hiệu hóa"
              cancelText="Hủy"
            >
              <Button
                danger
                size="small"
                icon={<StopOutlined />}
                loading={statusLoading[record.id]}
              >
                Vô hiệu hóa
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Kích hoạt model"
              description="Bạn có chắc chắn muốn kích hoạt model này?"
              onConfirm={() => handleActiveModel(record.id)}
              okText="Kích hoạt"
              cancelText="Hủy"
            >
              <Button
                type="primary"
                ghost
                size="small"
                icon={<PlayCircleOutlined />}
                loading={statusLoading[record.id]}
              >
                Kích hoạt
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Quản lý Vehicle Models</h2>
            <p className="text-gray-600 mt-1">
              Quản lý các model xe và màu sắc tương ứng
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Tạo Model Mới
          </Button>
        </div>
      </Card>

      <Table
        dataSource={models || []}
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateModel}
        >
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
              rules={[{ required: true, message: "Vui lòng nhập thương hiệu!" }]}
            >
              <Input placeholder="VinFast, Tesla..." />
            </Form.Item>

            <Form.Item
              label="Năm sản xuất"
              name="year"
              rules={[{ required: true, message: "Vui lòng nhập năm sản xuất!" }]}
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
              rules={[{ required: true, message: "Vui lòng nhập dung lượng pin!" }]}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                placeholder="87.7"
              />
            </Form.Item>

            <Form.Item
              label="Phạm vi hoạt động (km)"
              name="rangeKm"
              rules={[{ required: true, message: "Vui lòng nhập phạm vi hoạt động!" }]}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                placeholder="420"
              />
            </Form.Item>

            <Form.Item
              label="Thời gian sạc (phút)"
              name="chargingTime"
              rules={[{ required: true, message: "Vui lòng nhập thời gian sạc!" }]}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                placeholder="31"
              />
            </Form.Item>

            <Form.Item
              label="Tốc độ tối đa (km/h)"
              name="maxSpeed"
              rules={[{ required: true, message: "Vui lòng nhập tốc độ tối đa!" }]}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                placeholder="200"
              />
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
              rules={[{ required: true, message: "Vui lòng nhập số chỗ ngồi!" }]}
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
              rules={[{ required: true, message: "Vui lòng nhập dung tích cốp!" }]}
            >
              <InputNumber 
                min={0} 
                className="w-full"
                placeholder="376"
              />
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
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
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
              { type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }
            ]}
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => {
              setCreateModalVisible(false);
              form.resetFields();
            }}>
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={createLoading}
            >
              Tạo Model
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
