// src/pages/dealer/manageVehicles.jsx
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
  InputNumber,
} from "antd";
import {
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserAddOutlined,
  SyncOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;

export default function ManageVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [assigningVehicle, setAssigningVehicle] = useState(null);
  const [updatingStatusVehicle, setUpdatingStatusVehicle] = useState(null);
  const [filters, setFilters] = useState({
    status: undefined,
    activeOnly: true,
  });
  const [assignForm] = Form.useForm();
  const [statusForm] = Form.useForm();

  //  1. Load danh sách xe
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.activeOnly !== undefined)
        params.append("activeOnly", filters.activeOnly);

      const res = await apiClient.get(
        `/api/vehicle-instances?${params.toString()}`
      );
      if (res.data.success) {
        setVehicles(res.data.data || []);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  //  2. Load danh sách khách hàng
  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await apiClient.get("/api/customers");
      if (res.data.success) {
        setCustomers(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách khách hàng!");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách khách hàng!";
      message.error(errorMsg);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [filters]);

  useEffect(() => {
    if (assignModalOpen) {
      fetchCustomers();
    }
  }, [assignModalOpen]);

  //  3. Lấy chi tiết xe
  const fetchVehicleDetail = async (id) => {
    try {
      const res = await apiClient.get(`/api/vehicle-instances/${id}`);
      if (res.data.success) {
        setSelectedVehicle(res.data.data);
        setDetailModalOpen(true);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải chi tiết xe!");
      }
    } catch (err) {
      console.error("Error fetching vehicle detail:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải chi tiết xe!";
      message.error(errorMsg);
    }
  };

  //  4. Vô hiệu hóa xe
  const handleDeactivate = async (id) => {
    try {
      const res = await apiClient.patch(`/api/vehicle-instances/${id}/deactivate`);
      if (res.data.success) {
        message.success(res.data.message || "Vô hiệu hóa xe thành công!");
        fetchVehicles();
      } else {
        message.error(res.data.message || "Không thể vô hiệu hóa xe!");
      }
    } catch (err) {
      console.error("Error deactivating vehicle:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể vô hiệu hóa xe!";
      message.error(errorMsg);
    }
  };

  //  5. Kích hoạt lại xe
  const handleActivate = async (id) => {
    try {
      const res = await apiClient.patch(`/api/vehicle-instances/${id}/activate`);
      if (res.data.success) {
        message.success(res.data.message || "Kích hoạt lại xe thành công!");
        fetchVehicles();
      } else {
        message.error(res.data.message || "Không thể kích hoạt lại xe!");
      }
    } catch (err) {
      console.error("Error activating vehicle:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể kích hoạt lại xe!";
      message.error(errorMsg);
    }
  };

  //  6. Mở modal gán xe cho khách hàng
  const openAssignModal = (vehicle) => {
    setAssigningVehicle(vehicle);
    assignForm.resetFields();
    assignForm.setFieldsValue({
      vehicleId: vehicle.id,
      salePrice: vehicle.currentValue || undefined,
      warrantyStartDate: dayjs(),
      warrantyEndDate: dayjs().add(1, "year"),
    });
    setAssignModalOpen(true);
  };

  //  7. Xử lý gán xe cho khách hàng
  const handleAssignToCustomer = async () => {
    try {
      const values = await assignForm.validateFields();
      const payload = {
        vehicleId: values.vehicleId,
        customerId: values.customerId,
        salePrice: values.salePrice,
        warrantyStartDate: values.warrantyStartDate
          ? values.warrantyStartDate.format("YYYY-MM-DD")
          : undefined,
        warrantyEndDate: values.warrantyEndDate
          ? values.warrantyEndDate.format("YYYY-MM-DD")
          : undefined,
      };

      const res = await apiClient.post("/api/vehicle-instances/assign-customer", payload);
      if (res.data.success) {
        message.success(res.data.message || "Gán xe cho khách hàng thành công!");
        setAssignModalOpen(false);
        assignForm.resetFields();
        fetchVehicles();
      } else {
        message.error(res.data.message || "Không thể gán xe cho khách hàng!");
      }
    } catch (err) {
      console.error("Error assigning vehicle:", err);
      const errorMsg =
        err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      message.error(errorMsg);
    }
  };

  //  8. Mở modal cập nhật trạng thái
  const openStatusModal = (vehicle) => {
    setUpdatingStatusVehicle(vehicle);
    statusForm.resetFields();
    statusForm.setFieldsValue({
      status: vehicle.status,
    });
    setStatusModalOpen(true);
  };

  //  9. Xử lý cập nhật trạng thái
  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      const res = await apiClient.put(
        `/api/vehicle-instances/${updatingStatusVehicle.id}/status?status=${values.status}`
      );
      if (res.data.success) {
        message.success(res.data.message || "Cập nhật trạng thái xe thành công!");
        setStatusModalOpen(false);
        statusForm.resetFields();
        fetchVehicles();
      } else {
        message.error(res.data.message || "Không thể cập nhật trạng thái xe!");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      const errorMsg =
        err.response?.data?.message || "Đã xảy ra lỗi, vui lòng thử lại!";
      message.error(errorMsg);
    }
  };

  //  10. Cấu hình cột Table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "VIN",
      dataIndex: "vin",
      key: "vin",
      sorter: (a, b) => a.vin?.localeCompare(b.vin || "") || 0,
    },
    {
      title: "Số máy",
      dataIndex: "engineNumber",
      key: "engineNumber",
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
      title: "Đại lý",
      dataIndex: "dealerName",
      key: "dealerName",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          IN_STOCK: { text: "Trong kho", color: "green" },
          RESERVED: { text: "Đã đặt", color: "orange" },
          SOLD: { text: "Đã bán", color: "red" },
        };
        const info = statusMap[status] || { text: status, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
      filters: [
        { text: "Trong kho", value: "IN_STOCK" },
        { text: "Đã đặt", value: "RESERVED" },
        { text: "Đã bán", value: "SOLD" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Giá trị",
      dataIndex: "currentValue",
      key: "currentValue",
      render: (value) =>
        value
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(value)
          : "-",
      sorter: (a, b) => (a.currentValue || 0) - (b.currentValue || 0),
    },
    {
      title: "Ngày sản xuất",
      dataIndex: "manufacturingDate",
      key: "manufacturingDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
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
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => fetchVehicleDetail(record.id)}
            size="small"
          >
            Chi tiết
          </Button>
          {record.status !== "SOLD" && (
            <Button
              type="link"
              icon={<SyncOutlined />}
              onClick={() => openStatusModal(record)}
              size="small"
            >
              Đổi trạng thái
            </Button>
          )}
          {record.status === "IN_STOCK" && (
            <Button
              type="link"
              icon={<UserAddOutlined />}
              onClick={() => openAssignModal(record)}
              size="small"
            >
              Bán cho KH
            </Button>
          )}
          {record.isActive ? (
            <Popconfirm
              title="Xác nhận vô hiệu hóa"
              description="Bạn có chắc chắn muốn vô hiệu hóa xe này?"
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
              description="Bạn có chắc chắn muốn kích hoạt lại xe này?"
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
            <h2 className="text-2xl font-bold">Quản lý xe</h2>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Lọc theo trạng thái"
                allowClear
                value={filters.status}
                onChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <Option value="IN_STOCK">Trong kho</Option>
                <Option value="RESERVED">Đã đặt</Option>
                <Option value="SOLD">Đã bán</Option>
              </Select>
              <Select
                style={{ width: 150 }}
                value={filters.activeOnly}
                onChange={(value) =>
                  setFilters({ ...filters, activeOnly: value })
                }
              >
                <Option value={true}>Chỉ xe hoạt động</Option>
                <Option value={false}>Tất cả</Option>
              </Select>
              <Button icon={<SearchOutlined />} onClick={fetchVehicles}>
                Tìm kiếm
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={vehicles}
            loading={loading}
            bordered
            scroll={{ x: 1500 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} xe`,
            }}
          />
        </Card>

        {/* Modal chi tiết xe */}
        <Modal
          open={detailModalOpen}
          onCancel={() => {
            setDetailModalOpen(false);
            setSelectedVehicle(null);
          }}
          title="Chi tiết xe"
          footer={[
            <Button key="close" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>,
          ]}
          width={800}
        >
          {selectedVehicle && (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID">{selectedVehicle.id}</Descriptions.Item>
              <Descriptions.Item label="VIN">
                {selectedVehicle.vin}
              </Descriptions.Item>
              <Descriptions.Item label="Số máy">
                {selectedVehicle.engineNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Model">
                {selectedVehicle.modelName}
              </Descriptions.Item>
              <Descriptions.Item label="Màu">
                {selectedVehicle.colorName}
              </Descriptions.Item>
              <Descriptions.Item label="Đại lý">
                {selectedVehicle.dealerName}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedVehicle.status === "IN_STOCK"
                      ? "green"
                      : selectedVehicle.status === "RESERVED"
                      ? "orange"
                      : "red"
                  }
                >
                  {selectedVehicle.status === "IN_STOCK"
                    ? "Trong kho"
                    : selectedVehicle.status === "RESERVED"
                    ? "Đã đặt"
                    : "Đã bán"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái hệ thống">
                <Tag color={selectedVehicle.isActive ? "green" : "red"}>
                  {selectedVehicle.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Giá trị">
                {selectedVehicle.currentValue
                  ? new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(selectedVehicle.currentValue)
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sản xuất">
                {selectedVehicle.manufacturingDate
                  ? dayjs(selectedVehicle.manufacturingDate).format(
                      "DD/MM/YYYY"
                    )
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedVehicle.createdAt
                  ? dayjs(selectedVehicle.createdAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {selectedVehicle.updatedAt
                  ? dayjs(selectedVehicle.updatedAt).format(
                      "DD/MM/YYYY HH:mm:ss"
                    )
                  : "-"}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Modal gán xe cho khách hàng */}
        <Modal
          open={assignModalOpen}
          onCancel={() => {
            setAssignModalOpen(false);
            assignForm.resetFields();
            setAssigningVehicle(null);
          }}
          title={`Bán xe cho khách hàng - ${assigningVehicle?.modelName || ""}`}
          onOk={handleAssignToCustomer}
          okText="Xác nhận bán"
          cancelText="Hủy"
          width={600}
          destroyOnClose
        >
          <Form form={assignForm} layout="vertical">
            <Form.Item name="vehicleId" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="Khách hàng"
              name="customerId"
              rules={[
                { required: true, message: "Vui lòng chọn khách hàng!" },
              ]}
            >
              <Select
                placeholder="Chọn khách hàng"
                loading={loadingCustomers}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={customers
                  .filter((c) => c.isActive)
                  .map((customer) => ({
                    value: customer.id,
                    label: `${customer.fullName} - ${customer.phoneNumber}`,
                  }))}
              />
            </Form.Item>

            <Form.Item
              label="Giá bán (VND)"
              name="salePrice"
              rules={[
                { required: true, message: "Vui lòng nhập giá bán!" },
                {
                  type: "number",
                  min: 0,
                  message: "Giá bán phải lớn hơn 0!",
                },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                placeholder="Nhập giá bán"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>

            <Form.Item
              label="Ngày bắt đầu bảo hành"
              name="warrantyStartDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày bắt đầu bảo hành!",
                },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày bắt đầu bảo hành"
              />
            </Form.Item>

            <Form.Item
              label="Ngày kết thúc bảo hành"
              name="warrantyEndDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày kết thúc bảo hành!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startDate = getFieldValue("warrantyStartDate");
                    if (!value || !startDate) {
                      return Promise.resolve();
                    }
                    if (value.isBefore(startDate)) {
                      return Promise.reject(
                        new Error(
                          "Ngày kết thúc phải sau ngày bắt đầu bảo hành!"
                        )
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày kết thúc bảo hành"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal cập nhật trạng thái */}
        <Modal
          open={statusModalOpen}
          onCancel={() => {
            setStatusModalOpen(false);
            statusForm.resetFields();
            setUpdatingStatusVehicle(null);
          }}
          title={`Cập nhật trạng thái xe - ${updatingStatusVehicle?.modelName || ""}`}
          onOk={handleUpdateStatus}
          okText="Cập nhật"
          cancelText="Hủy"
          width={500}
          destroyOnClose
        >
          <Form form={statusForm} layout="vertical">
            <Form.Item
              label="Trạng thái"
              name="status"
              rules={[
                { required: true, message: "Vui lòng chọn trạng thái!" },
              ]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="IN_STOCK">Trong kho</Option>
                <Option value="RESERVED">Đã đặt</Option>
              </Select>
            </Form.Item>
            <p className="text-sm text-gray-500">
              Lưu ý: Chỉ có thể chuyển đổi giữa "Trong kho" và "Đã đặt". Không
              thể chuyển từ "Đã bán" sang trạng thái khác.
            </p>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}

