import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Space,
  DatePicker,
  Descriptions,
  Tooltip,
  Switch,
  Row,
  Col,
} from "antd";
import { useState, useEffect, useMemo, useCallback } from "react";
import dayjs from "dayjs";
import api from "../../config/axios";
import { EyeOutlined, EditOutlined } from "@ant-design/icons";

export default function ManageUsers() {
  const [messageApi, contextHolder] = message.useMessage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [dealers, setDealers] = useState([]); // danh sách đại lý để có thể mở rộng filter sau
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [togglingIds, setTogglingIds] = useState(new Set());
  // Edit modal states
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [selectedRoleEdit, setSelectedRoleEdit] = useState(null);
  const [editForm] = Form.useForm();

  // Không cho phép tắt tài khoản ADMIN ở phía FE
  const isAdminUser = (u) => {
    const roles = u?.roles;
    if (!Array.isArray(roles)) return false;
    return roles.some((r) => String(r).toUpperCase().includes("ADMIN"));
  };

  // Bỏ dấu tiếng Việt để tìm kiếm đại lý không phân biệt dấu
  const stripVN = (s = "") =>
    s
      .toString()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // BE API: GET /api/users
      const res = await api.get("admin/users");
      console.log("API Response:", res.data); // Debug log

      // Đảm bảo users luôn là array
      if (res.data && Array.isArray(res.data)) {
        setUsers(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        // Xử lý các định dạng response phổ biến như { data: [...] } hoặc { success: true, data: [...] }
        setUsers(res.data.data);
      } else {
        console.warn("Unexpected API response format:", res.data);
        setUsers([]); // Fallback to empty array
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to load users";
      messageApi.error(errorMessage);
      setUsers([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  const fetchDealers = useCallback(async () => {
    try {
      const res = await api.get("dealers");
      const payload = res.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.content)) list = payload.content;
      setDealers(list);
    } catch (error) {
      console.error("Error fetching dealers:", error);
      setDealers([]);
    }
  }, []);
  // Map dealerId->name nhanh (chuẩn bị cho filter tương lai)
  const dealerNameById = useMemo(() => {
    const map = new Map();
    dealers.forEach((d) => {
      if (d?.id != null) map.set(String(d.id), d?.name || `Dealer #${d.id}`);
    });
    return map;
  }, [dealers]);

  const handleCreateUser = async (values) => {
    try {
      // Format dateOfBirth to ISO string if it exists
      const formattedValues = {
        ...values,
        dateOfBirth:
          values.dateOfBirth &&
          values.dateOfBirth.isValid &&
          values.dateOfBirth.isValid()
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
        roleName: values.roleName,
        dealerId:
          values.dealerId !== undefined && values.dealerId !== null
            ? Number(values.dealerId)
            : 0,
      };

      // Remove roles field if exists (use roleName instead)
      delete formattedValues.roles;

      console.log("Sending data:", formattedValues);

      await api.post("admin/users", formattedValues);
      messageApi.success("Tạo tài khoản thành công! Email đã được gửi.");
      form.resetFields();
      setOpen(false);
      setSelectedRole(null);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create user";
      messageApi.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDealers();
  }, [fetchUsers, fetchDealers]);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Đại lý",
      key: "dealer",
      render: (_, record) => {
        const name =
          record?.dealerName ||
          dealerNameById.get(String(record?.dealerId)) ||
          null;
        return name ? (
          <Tag color="blue">{name}</Tag>
        ) : (
          <Tag color="default">EVM</Tag>
        );
      },
    },
    {
      title: "Roles",
      dataIndex: "roles",
      render: (roles) => (
        <Space wrap>
          {Array.isArray(roles) ? (
            roles.map((role, index) => (
              <Tag key={index} color="blue">
                {role.replace("ROLE_", "")}
              </Tag>
            ))
          ) : (
            <Tag color="default">No roles</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "active",
      width: 220,
      render: (active, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ width: 96, display: "flex", justifyContent: "center" }}>
            <Tag color={active ? "green" : "default"} style={{ margin: 0 }}>
              {active ? "Hoạt động" : "Ngừng"}
            </Tag>
          </div>
          <Switch
            size="small"
            disabled={isAdminUser(record)}
            checked={!!active}
            onChange={() => toggleStatus(record)}
            loading={togglingIds.has(record.id)}
          />
        </div>
      ),
    },
    {
      title: "Chi tiết",
      key: "detail",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleOpenDetail(record.id)}
            />
          </Tooltip>
          <Tooltip
            title={
              isAdminUser(record)
                ? "Không thể cập nhật tài khoản ADMIN"
                : "Cập nhật"
            }
          >
            <Button
              type="text"
              icon={<EditOutlined />}
              disabled={isAdminUser(record)}
              onClick={() => openEditUser(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleOpenDetail = async (userId) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailUser(null);
    try {
      const res = await api.get(`admin/users/${userId}`);
      const payload = res?.data;
      const data = payload?.data ?? payload; // chấp nhận {data:{...}} hoặc {...}
      setDetailUser(data || null);
    } catch (e) {
      console.error("Fetch user detail failed", e);
      messageApi.error(
        e?.response?.data?.message || "Không tải được chi tiết người dùng"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const toggleStatus = async (user) => {
    if (!user?.id) return;
    if (isAdminUser(user)) {
      messageApi.warning("Không thể thay đổi trạng thái của tài khoản ADMIN");
      return;
    }
    const id = user.id;
    setTogglingIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    try {
      const endpoint = user.active
        ? `admin/users/${id}/deactivate`
        : `admin/users/${id}/activate`;
      const res = await api.patch(endpoint);
      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Cập nhật trạng thái thất bại");
      }
      const key = `user-toggle-${id}`;
      messageApi.loading({ content: "Đang cập nhật trạng thái...", key });
      messageApi.success({
        content: user.active ? "Đã ngừng hoạt động" : "Đã bật hoạt động",
        key,
      });
      // Cập nhật nhanh trên UI
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !user.active } : u))
      );
    } catch (e) {
      console.error("Toggle status failed", e);
      messageApi.error(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể cập nhật trạng thái"
      );
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Open Edit User modal (except ADMIN)
  const openEditUser = async (record) => {
    if (!record?.id) return;
    if (isAdminUser(record)) {
      messageApi.warning("Không thể cập nhật tài khoản ADMIN");
      return;
    }
    // Refresh dealers list before opening edit to ensure latest options
    try {
      await fetchDealers();
    } catch (e) {
      console.warn("fetchDealers failed before edit", e);
    }
    setEditingUserId(record.id);
    setEditOpen(true);
    setEditLoading(true);
    try {
      const res = await api.get(`admin/users/${record.id}`);
      const payload = res?.data;
      const data = payload?.data ?? payload;
      // Chọn roleName đầu tiên phù hợp (loại ADMIN nếu có)
      const roleName = Array.isArray(data?.roles)
        ? data.roles.find((r) => r && r !== "ADMIN") || data.roles[0]
        : data?.roleName;
      setSelectedRoleEdit(roleName || null);
      editForm.setFieldsValue({
        fullName: data?.fullName ?? "",
        email: data?.email ?? "",
        phoneNumber: data?.phoneNumber ?? "",
        idNumber: data?.idNumber ?? "",
        dateOfBirth: data?.dateOfBirth ? dayjs(data.dateOfBirth) : null,
        gender: data?.gender ?? "MALE",
        address: data?.address ?? "",
        roleName: roleName,
        dealerId: data?.dealerId ?? undefined,
      });
    } catch (e) {
      console.error("Open edit user failed", e);
      messageApi.error(
        e?.response?.data?.message || "Không tải được thông tin người dùng"
      );
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {
        ...values,
        dateOfBirth:
          values.dateOfBirth &&
          values.dateOfBirth.isValid &&
          values.dateOfBirth.isValid()
            ? values.dateOfBirth.format("YYYY-MM-DD")
            : null,
        roleName: values.roleName,
        dealerId:
          values.dealerId !== undefined && values.dealerId !== null
            ? Number(values.dealerId)
            : 0,
      };
      const key = `user-update-${editingUserId}`;
      messageApi.loading({ content: "Đang lưu...", key });
      const res = await api.put(`admin/users/${editingUserId}`, payload);
      if (res?.data?.success === false) {
        throw new Error(res?.data?.message || "Cập nhật thất bại");
      }
      messageApi.success({ content: "Cập nhật thông tin thành công", key });
      setEditOpen(false);
      editForm.resetFields();
      fetchUsers();
    } catch (err) {
      if (err?.errorFields) return; // validation error
      console.error("Update user failed", err);
      messageApi.error(
        err?.response?.data?.message || err?.message || "Cập nhật thất bại"
      );
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">User Management</h2>
        <Button
          type="primary"
          onClick={() => {
            fetchDealers(); // refresh danh sách đại lý mới nhất trước khi mở
            setOpen(true);
          }}
        >
          + Create New
        </Button>
      </div>

      <Table
        dataSource={users || []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: 1000 }}
        size="middle"
      />

      {/* Modal chi tiết người dùng */}
      <Modal
        open={detailOpen}
        title="Thông tin người dùng"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={700}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: 24 }}>
            <span className="animate-pulse text-gray-500">Đang tải...</span>
          </div>
        ) : detailUser ? (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="User ID">
              {detailUser.id ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {detailUser.username ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {detailUser.email ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {detailUser.fullName ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {detailUser.phoneNumber ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="CMND/CCCD">
              {detailUser.idNumber ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {detailUser.dateOfBirth
                ? new Date(detailUser.dateOfBirth).toLocaleDateString()
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {detailUser.gender ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {detailUser.address ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {detailUser.active ? (
                <Tag color="green">Hoạt động</Tag>
              ) : (
                <Tag>Ngừng</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              <Space wrap>
                {(detailUser.roles || []).length
                  ? detailUser.roles.map((r, i) => (
                      <Tag key={i} color="blue">
                        {String(r).replace(/^ROLE_/, "")}
                      </Tag>
                    ))
                  : "-"}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Đại lý">
              {detailUser.dealerName ? (
                <Tag color="geekblue">{detailUser.dealerName}</Tag>
              ) : (
                <Tag>EVM</Tag>
              )}
            </Descriptions.Item>
            {detailUser.dealerId != null && (
              <Descriptions.Item label="Dealer ID">
                {detailUser.dealerId}
              </Descriptions.Item>
            )}
          </Descriptions>
        ) : (
          <div style={{ textAlign: "center", padding: 16 }}>
            Không có dữ liệu.
          </div>
        )}
      </Modal>

      {/* Modal cập nhật người dùng */}
      <Modal
        open={editOpen}
        title="Cập nhật người dùng"
        onCancel={() => {
          setEditOpen(false);
          editForm.resetFields();
        }}
        confirmLoading={editLoading}
        onOk={handleUpdateUser}
        okText="Lưu"
        cancelText="Hủy"
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  {
                    validator: (_, value) => {
                      const v = (value || "").trim();
                      if (!v) return Promise.reject("Vui lòng nhập họ tên!");
                      if (v.length < 3)
                        return Promise.reject("Họ tên tối thiểu 3 ký tự");
                      if (v.length > 100)
                        return Promise.reject("Họ tên tối đa 100 ký tự");
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  {
                    type: "email",
                    message: "Email không hợp lệ!",
                    transform: (v) => (typeof v === "string" ? v.trim() : v),
                  },
                ]}
              >
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    validator: (_, value) => {
                      const raw = (value || "").replace(/[\s-]/g, "");
                      if (!raw)
                        return Promise.reject("Vui lòng nhập số điện thoại!");
                      const pattern = /^(0\d{9}|\+84\d{9})$/;
                      if (!pattern.test(raw))
                        return Promise.reject(
                          "Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)"
                        );
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idNumber"
                label="Số CMND/CCCD"
                rules={[
                  {
                    validator: (_, value) => {
                      const v = (value || "").trim();
                      if (!v)
                        return Promise.reject("Vui lòng nhập số CMND/CCCD!");
                      if (!/(^\d{9}$)|(^\d{12}$)/.test(v))
                        return Promise.reject(
                          "CMND/CCCD phải 9 hoặc 12 chữ số"
                        );
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập số CMND/CCCD" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value)
                        return Promise.reject("Vui lòng chọn ngày sinh!");
                      if (!value.isValid())
                        return Promise.reject("Ngày sinh không hợp lệ");
                      if (value.isAfter(dayjs(), "day"))
                        return Promise.reject(
                          "Ngày sinh không được ở tương lai"
                        );
                      const age = dayjs().diff(value, "year");
                      if (age < 18)
                        return Promise.reject("Tuổi phải từ 18 trở lên");
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              {
                validator: (_, value) => {
                  const v = (value || "").trim();
                  if (!v) return Promise.reject("Vui lòng nhập địa chỉ!");
                  if (v.length < 5)
                    return Promise.reject("Địa chỉ tối thiểu 5 ký tự");
                  if (v.length > 200)
                    return Promise.reject("Địa chỉ tối đa 200 ký tự");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select
                  placeholder="Chọn vai trò"
                  value={selectedRoleEdit || undefined}
                  onChange={(value) => {
                    setSelectedRoleEdit(value);
                    editForm.setFieldsValue({ dealerId: undefined });
                  }}
                  options={[
                    { label: "EVM Staff", value: "EVM_STAFF" },
                    { label: "Dealer Manager", value: "DEALER_MANAGER" },
                    { label: "Dealer Staff", value: "DEALER_STAFF" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dealerId"
                label="Đại lý"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        (selectedRoleEdit === "DEALER_MANAGER" ||
                          selectedRoleEdit === "DEALER_STAFF") &&
                        !value
                      ) {
                        return Promise.reject("Vui lòng chọn đại lý!");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  disabled={
                    !selectedRoleEdit || selectedRoleEdit === "EVM_STAFF"
                  }
                  showSearch
                  placeholder={
                    selectedRoleEdit === "DEALER_MANAGER" ||
                    selectedRoleEdit === "DEALER_STAFF"
                      ? "Chọn đại lý"
                      : "Chọn vai trò Dealer trước"
                  }
                  loading={!dealers.length}
                  filterOption={(input, option) =>
                    stripVN(option?.label || "").includes(stripVN(input))
                  }
                  options={dealers.map((d) => ({
                    label: d?.name || `Dealer #${d?.id}`,
                    value: d?.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
      <Modal
        open={open}
        title="Create New Account"
        onCancel={() => {
          setOpen(false);
          setSelectedRole(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateUser}
          initialValues={{
            gender: "MALE",
          }}
        >
          {/* Validation helper functions */}
          {/** We define them inside component to access dayjs */}
          <></>
          {/* Full name & Email */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  {
                    validator: (_, value) => {
                      const v = (value || "").trim();
                      if (!v) return Promise.reject("Vui lòng nhập họ tên!");
                      if (v.length < 3)
                        return Promise.reject("Họ tên tối thiểu 3 ký tự");
                      if (v.length > 100)
                        return Promise.reject("Họ tên tối đa 100 ký tự");
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ!",
                    transform: (v) => (typeof v === "string" ? v.trim() : v),
                  },
                ]}
              >
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  {
                    validator: (_, value) => {
                      const raw = (value || "").replace(/[\s-]/g, "");
                      if (!raw)
                        return Promise.reject("Vui lòng nhập số điện thoại!");
                      const pattern = /^(0\d{9}|\+84\d{9})$/;
                      if (!pattern.test(raw))
                        return Promise.reject(
                          "Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)"
                        );
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="idNumber"
                label="Số CMND/CCCD"
                rules={[
                  {
                    validator: (_, value) => {
                      const v = (value || "").trim();
                      if (!v)
                        return Promise.reject("Vui lòng nhập số CMND/CCCD!");
                      if (!/(^\d{9}$)|(^\d{12}$)/.test(v))
                        return Promise.reject(
                          "CMND/CCCD phải 9 hoặc 12 chữ số"
                        );
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Nhập số CMND/CCCD" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!value)
                        return Promise.reject("Vui lòng chọn ngày sinh!");
                      if (!value.isValid())
                        return Promise.reject("Ngày sinh không hợp lệ");
                      if (value.isAfter(dayjs(), "day"))
                        return Promise.reject(
                          "Ngày sinh không được ở tương lai"
                        );
                      const age = dayjs().diff(value, "year");
                      if (age < 18)
                        return Promise.reject("Tuổi phải từ 18 trở lên");
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày sinh"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[
              {
                validator: (_, value) => {
                  const v = (value || "").trim();
                  if (!v) return Promise.reject("Vui lòng nhập địa chỉ!");
                  if (v.length < 5)
                    return Promise.reject("Địa chỉ tối thiểu 5 ký tự");
                  if (v.length > 200)
                    return Promise.reject("Địa chỉ tối đa 200 ký tự");
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input.TextArea placeholder="Nhập địa chỉ" rows={2} />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleName"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
              >
                <Select
                  placeholder="Chọn vai trò"
                  onChange={(value) => {
                    setSelectedRole(value);
                    form.setFieldsValue({ dealerId: undefined });
                  }}
                  options={[
                    { label: "EVM Staff", value: "EVM_STAFF" },
                    { label: "Dealer Manager", value: "DEALER_MANAGER" },
                    { label: "Dealer Staff", value: "DEALER_STAFF" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dealerId"
                label="Đại lý"
                rules={[
                  {
                    validator: (_, value) => {
                      if (
                        (selectedRole === "DEALER_MANAGER" ||
                          selectedRole === "DEALER_STAFF") &&
                        !value
                      ) {
                        return Promise.reject("Vui lòng chọn đại lý!");
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Select
                  disabled={!selectedRole || selectedRole === "EVM_STAFF"}
                  showSearch
                  placeholder={
                    selectedRole === "DEALER_MANAGER" ||
                    selectedRole === "DEALER_STAFF"
                      ? "Chọn đại lý"
                      : "Chọn vai trò Dealer trước"
                  }
                  loading={!dealers.length}
                  filterOption={(input, option) =>
                    stripVN(option?.label || "").includes(stripVN(input))
                  }
                  options={dealers.map((d) => ({
                    label: d?.name || `Dealer #${d?.id}`,
                    value: d?.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            size="large"
          >
            Tạo tài khoản
          </Button>
        </Form>
      </Modal>
    </>
  );
}
