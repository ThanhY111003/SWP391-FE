// src/pages/dealer/warrantyManagement.jsx
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  Space,
  Card,
} from "antd";
import {
  PlusOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import DealerLayout from "../components/dealerlayout";
import apiClient from "../../utils/axiosConfig";

const { Option } = Select;
const { TextArea } = Input;

export default function WarrantyManagement() {
  const [warrantyRequests, setWarrantyRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // 1. Load danh sách yêu cầu bảo hành
  const fetchWarrantyRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/api/warranty/dealer/my");
      if (res.data.success) {
        setWarrantyRequests(res.data.data || []);
      } else {
        message.error(
          res.data.message || "Không thể tải danh sách yêu cầu bảo hành!"
        );
      }
    } catch (err) {
      console.error("Error fetching warranty requests:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Không thể tải danh sách yêu cầu bảo hành!";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Load danh sách xe để tạo yêu cầu bảo hành
  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await apiClient.get("/api/vehicle-instances?activeOnly=true");
      if (res.data.success) {
        // Lấy tất cả các xe active để tạo yêu cầu bảo hành
        setVehicles(res.data.data.filter((v) => v.isActive) || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe!");
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe!";
      message.error(errorMsg);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchWarrantyRequests();
  }, []);

  useEffect(() => {
    if (createModalOpen) {
      fetchVehicles();
    }
  }, [createModalOpen]);

  // 3. Tạo yêu cầu bảo hành
  const handleCreateWarranty = async () => {
    try {
      const values = await createForm.validateFields();
      const params = new URLSearchParams();
      params.append("reason", values.reason);

      const res = await apiClient.post(
        `/api/warranty/dealer/${values.vehicleId}/request?${params.toString()}`
      );
      if (res.data.success) {
        const responseMessage =
          res.data.message || "Tạo yêu cầu bảo hành thành công!";
        toast.success(responseMessage);
        setCreateModalOpen(false);
        createForm.resetFields();
        fetchWarrantyRequests();
      } else {
        toast.error(res.data.message || "Không thể tạo yêu cầu bảo hành!");
      }
    } catch (err) {
      console.error("Error creating warranty request:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tạo yêu cầu bảo hành!";
      toast.error(errorMsg);
    }
  };

  // 4. Hủy yêu cầu bảo hành
  const handleCancelWarranty = async (id) => {
    try {
      const res = await apiClient.patch(`/api/warranty/dealer/${id}/cancel`);
      if (res.data.success) {
        toast.success(res.data.message || "Hủy yêu cầu bảo hành thành công!");
        fetchWarrantyRequests();
      } else {
        toast.error(res.data.message || "Không thể hủy yêu cầu bảo hành!");
      }
    } catch (err) {
      console.error("Error canceling warranty request:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể hủy yêu cầu bảo hành!";
      toast.error(errorMsg);
    }
  };

  // 5. Xác nhận nhận lại xe sau bảo hành
  const handleConfirmWarranty = async (id) => {
    try {
      const res = await apiClient.patch(`/api/warranty/dealer/${id}/confirm`);
      if (res.data.success) {
        const responseMessage =
          res.data.message || "Xác nhận nhận xe sau bảo hành thành công!";
        toast.success(responseMessage);
        fetchWarrantyRequests();
      } else {
        toast.error(res.data.message || "Không thể xác nhận nhận xe!");
      }
    } catch (err) {
      console.error("Error confirming warranty request:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể xác nhận nhận xe!";
      toast.error(errorMsg);
    }
  };

  // 5. Cấu hình cột Table
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
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      ellipsis: true,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const statusMap = {
          PENDING: { text: "Chờ xử lý", color: "orange" },
          APPROVED: { text: "Đã phê duyệt", color: "blue" },
          REJECTED: { text: "Đã từ chối", color: "red" },
          IN_REPAIR: { text: "Đang sửa chữa", color: "purple" },
          COMPLETED: { text: "Hoàn thành", color: "green" },
          CANCELLED: { text: "Đã hủy", color: "default" },
          CONFIRMED: { text: "Đã xác nhận", color: "cyan" },
        };
        const info = statusMap[status] || { text: status, color: "default" };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "-",
      sorter: (a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
      },
    },
    {
      title: "Ngày cập nhật",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY HH:mm:ss") : "-",
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 220,
      fixed: "right",
      render: (_, record) => {
        // Chỉ cho phép hủy khi trạng thái là PENDING hoặc APPROVED
        const canCancel =
          record.status === "PENDING" || record.status === "APPROVED";
        // Chỉ cho phép dealer xác nhận khi trạng thái là COMPLETED
        const canConfirm = record.status === "COMPLETED";

        return (
          <Space size="small">
            {canCancel && (
              <Popconfirm
                title="Xác nhận hủy"
                description="Bạn có chắc chắn muốn hủy yêu cầu bảo hành này?"
                onConfirm={() => handleCancelWarranty(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button
                  type="link"
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                >
                  Hủy
                </Button>
              </Popconfirm>
            )}
            {canConfirm && (
              <Popconfirm
                title="Xác nhận nhận xe"
                description="Bạn đã nhận lại xe sau bảo hành?"
                onConfirm={() => handleConfirmWarranty(record.id)}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <Button type="link" size="small">
                  Xác nhận
                </Button>
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <DealerLayout>
      <div className="p-3 sm:p-6">
        <Card>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-bold">
              Quản lý yêu cầu bảo hành
            </h2>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={fetchWarrantyRequests}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                Tạo yêu cầu bảo hành
              </Button>
            </Space>
          </div>

          <Table
            rowKey="id"
            columns={columns}
            dataSource={warrantyRequests}
            loading={loading}
            bordered
            scroll={{ x: "max-content" }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
              responsive: true,
            }}
          />
        </Card>

        {/* Modal tạo yêu cầu bảo hành */}
        <Modal
          open={createModalOpen}
          onCancel={() => {
            setCreateModalOpen(false);
            createForm.resetFields();
          }}
          title="Tạo yêu cầu bảo hành/sửa chữa"
          onOk={handleCreateWarranty}
          okText="Tạo yêu cầu"
          cancelText="Hủy"
          width={{ xs: "90%", sm: 600 }}
          destroyOnClose
        >
          <Form form={createForm} layout="vertical">
            <Form.Item
              label="Chọn xe"
              name="vehicleId"
              rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
            >
              <Select
                placeholder="Chọn xe cần bảo hành/sửa chữa"
                loading={loadingVehicles}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={vehicles.map((vehicle) => ({
                  value: vehicle.id,
                  label: `${vehicle.vin} - ${vehicle.modelName} (${vehicle.colorName})`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Lý do"
              name="reason"
              rules={[
                { required: true, message: "Vui lòng nhập lý do!" },
                { min: 5, message: "Lý do phải có ít nhất 5 ký tự!" },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Nhập lý do yêu cầu bảo hành/sửa chữa..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DealerLayout>
  );
}
