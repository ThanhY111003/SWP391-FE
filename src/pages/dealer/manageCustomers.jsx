// src/pages/dealer/manageCustomers.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  message,
  Popconfirm,
  Descriptions,
  Space,
  Card,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;
const { TextArea } = Input;

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [form] = Form.useForm();

  //  1. Load danh sách khách hàng
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/customers");
      if (res.data.success) {
        setCustomers(res.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      message.error("Không thể tải danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  //  2. Xử lý mở modal (thêm/sửa)
  const openModal = (record = null) => {
    setEditingCustomer(record);
    if (record) {
      form.setFieldsValue({
        ...record,
        dateOfBirth: record.dateOfBirth ? dayjs(record.dateOfBirth) : null,
      });
    } else {
      form.resetFields();
    }
    setModalOpen(true);
  };

  //  3. Lấy chi tiết khách hàng
  const fetchCustomerDetail = async (id) => {
    try {
      const res = await apiClient.get(`/api/customers/${id}`);
      if (res.data.success) {
        setSelectedCustomer(res.data.data);
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error("Error fetching customer detail:", err);
      message.error("Không thể tải chi tiết khách hàng!");
    }
  };

  //  4. Gửi dữ liệu khi nhấn Save
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.format("YYYY-MM-DD")
          : undefined,
      };

      if (editingCustomer) {
        // Update
        await apiClient.put(`/api/customers/${editingCustomer.id}`, payload);
        message.success("Cập nhật khách hàng thành công!");
      } else {
        // Create
        await apiClient.post("/api/customers", payload);
        message.success("Tạo khách hàng mới thành công!");
      }

      setModalOpen(false);
      form.resetFields();
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      const errorMsg =
        err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      message.error(errorMsg);
    }
  };

  //  5. Vô hiệu hóa khách hàng
  const handleDeactivate = async (id) => {
    try {
      await apiClient.patch(`/api/customers/${id}/deactivate`);
      message.success("Vô hiệu hóa khách hàng thành công!");
      fetchCustomers();
    } catch (err) {
      console.error("Error deactivating customer:", err);
      message.error("Không thể vô hiệu hóa khách hàng!");
    }
  };

  //  6. Kích hoạt lại khách hàng
  const handleActivate = async (id) => {
    try {
      await apiClient.patch(`/api/customers/${id}/activate`);
      message.success("Kích hoạt lại khách hàng thành công!");
      fetchCustomers();
    } catch (err) {
      console.error("Error activating customer:", err);
      message.error("Không thể kích hoạt lại khách hàng!");
    }
  };

  //  7. Cấu hình cột Table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "CMND/CCCD",
      dataIndex: "idNumber",
      key: "idNumber",
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => {
        const genderMap = {
          MALE: { text: "Nam", color: "blue" },
          FEMALE: { text: "Nữ", color: "pink" },
          OTHER: { text: "Khác", color: "default" },
        };
        const info = genderMap[gender] || { text: gender, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Hoạt động" : "Vô hiệu hóa"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => fetchCustomerDetail(record.id)}
            size="small"
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
            size="small"
          >
            Sửa
          </Button>
          {record.isActive ? (
            <Popconfirm
              title="Xác nhận vô hiệu hóa"
              description="Bạn có chắc chắn muốn vô hiệu hóa khách hàng này?"
              onConfirm={() => handleDeactivate(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                size="small"
              >
                Vô hiệu
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Xác nhận kích hoạt"
              description="Bạn có chắc chắn muốn kích hoạt lại khách hàng này?"
              onConfirm={() => handleActivate(record.id)}
              okText="Xác nhận"
              cancelText="Hủy"
            >
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                size="small"
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
    <DealerLayout>
      <div className="p-6">
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quản lý khách hàng</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              Thêm khách hàng
            </Button>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={customers}
            loading={loading}
            bordered
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khách hàng`,
            }}
          />
        </Card>

        {/* Modal thêm/sửa khách hàng */}
        <Modal
          open={modalOpen}
          onCancel={() => {
            setModalOpen(false);
            form.resetFields();
          }}
          title={editingCustomer ? "Cập nhật khách hàng" : "Thêm khách hàng mới"}
          onOk={handleSubmit}
          okText="Lưu"
          cancelText="Hủy"
          width={700}
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Họ tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                { min: 2, message: "Họ tên phải có ít nhất 2 ký tự!" },
              ]}
            >
              <Input placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              label="Số điện thoại"
              name="phoneNumber"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại phải có 10-11 chữ số!",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label="CMND/CCCD"
              name="idNumber"
              rules={[
                { required: !editingCustomer, message: "Vui lòng nhập CMND/CCCD!" },
                {
                  pattern: /^[0-9]{9,12}$/,
                  message: "CMND/CCCD phải có 9-12 chữ số!",
                },
              ]}
            >
              <Input placeholder="Nhập CMND/CCCD" />
            </Form.Item>

            <Form.Item
              label="Ngày sinh"
              name="dateOfBirth"
              rules={[
                {
                  required: !editingCustomer,
                  message: "Vui lòng chọn ngày sinh!",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>

            <Form.Item
              label="Giới tính"
              name="gender"
              rules={[
                { required: !editingCustomer, message: "Vui lòng chọn giới tính!" },
              ]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[
                {
                  required: !editingCustomer,
                  message: "Vui lòng nhập địa chỉ!",
                },
              ]}
            >
              <TextArea
                rows={3}
                placeholder="Nhập địa chỉ"
              />
            </Form.Item>

            <Form.Item label="Ghi chú" name="notes">
              <TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal chi tiết khách hàng */}
        <Modal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedCustomer(null);
          }}
          title="Chi tiết khách hàng"
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedCustomer && (
            <div>
              <Descriptions bordered column={2}>
                <Descriptions.Item label="ID">{selectedCustomer.id}</Descriptions.Item>
                <Descriptions.Item label="Họ tên">
                  {selectedCustomer.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {selectedCustomer.phoneNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {selectedCustomer.email}
                </Descriptions.Item>
                <Descriptions.Item label="CMND/CCCD">
                  {selectedCustomer.idNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {selectedCustomer.dateOfBirth
                    ? dayjs(selectedCustomer.dateOfBirth).format("DD/MM/YYYY")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {selectedCustomer.gender === "MALE"
                    ? "Nam"
                    : selectedCustomer.gender === "FEMALE"
                    ? "Nữ"
                    : "Khác"}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={selectedCustomer.isActive ? "green" : "red"}>
                    {selectedCustomer.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedCustomer.address || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={2}>
                  {selectedCustomer.notes || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {selectedCustomer.createdAt
                    ? dayjs(selectedCustomer.createdAt).format("DD/MM/YYYY HH:mm:ss")
                    : "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cập nhật">
                  {selectedCustomer.updatedAt
                    ? dayjs(selectedCustomer.updatedAt).format("DD/MM/YYYY HH:mm:ss")
                    : "-"}
                </Descriptions.Item>
              </Descriptions>

              {/* Danh sách xe đã mua */}
              {selectedCustomer.vehiclesPurchased &&
                selectedCustomer.vehiclesPurchased.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">
                      Xe đã mua ({selectedCustomer.vehiclesPurchased.length})
                    </h3>
                    <Table
                      dataSource={selectedCustomer.vehiclesPurchased}
                      rowKey="id"
                      pagination={false}
                      size="small"
                      columns={[
                        {
                          title: "VIN",
                          dataIndex: "vin",
                          key: "vin",
                        },
                        {
                          title: "Model",
                          dataIndex: "modelName",
                          key: "modelName",
                        },
                        {
                          title: "Màu",
                          dataIndex: "colorName",
                          key: "colorName",
                        },
                        {
                          title: "Giá bán",
                          dataIndex: "salePrice",
                          key: "salePrice",
                          render: (price) =>
                            price
                              ? new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(price)
                              : "-",
                        },
                        {
                          title: "Ngày bán",
                          dataIndex: "saleDate",
                          key: "saleDate",
                          render: (date) =>
                            date ? dayjs(date).format("DD/MM/YYYY") : "-",
                        },
                        {
                          title: "Bảo hành",
                          key: "warranty",
                          render: (_, record) =>
                            record.warrantyStartDate && record.warrantyEndDate
                              ? `${dayjs(record.warrantyStartDate).format(
                                  "DD/MM/YYYY"
                                )} - ${dayjs(record.warrantyEndDate).format(
                                  "DD/MM/YYYY"
                                )}`
                              : "-",
                        },
                      ]}
                    />
                  </div>
                )}
            </div>
          )}
        </Modal>
      </div>
    </DealerLayout>
  );
}

