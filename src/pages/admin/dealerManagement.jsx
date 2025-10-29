import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  message,
  Descriptions,
  Spin,
  Tooltip,
  Typography,
  Select,
  Switch,
} from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentDealerId, setCurrentDealerId] = useState(null);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailDealer, setDetailDealer] = useState(null);
  const [form] = Form.useForm();
  const [togglingIds, setTogglingIds] = useState(new Set());

  // Tìm kiếm & lọc
  const [searchText, setSearchText] = useState("");
  const [filterRegion, setFilterRegion] = useState();
  const [filterStatus, setFilterStatus] = useState(); // true | false | undefined
  // Lọc theo trạng thái từ SERVER (để lấy cả đại lý ngừng nếu BE hỗ trợ)
  const [serverStatus, setServerStatus] = useState(); // 'ALL' | 'ACTIVE' | 'INACTIVE' | undefined

  // Helper: trim string an toàn
  const trimSafe = (v) => (typeof v === "string" ? v.trim() : v);

  // Validator: Tên tối thiểu 3 ký tự
  const nameValidator = (_, value) => {
    const v = trimSafe(value) || "";
    if (!v) return Promise.reject(new Error("Vui lòng nhập tên đại lý"));
    if (v.length < 3)
      return Promise.reject(new Error("Tên đại lý tối thiểu 3 ký tự"));
    if (v.length > 100)
      return Promise.reject(new Error("Tên đại lý tối đa 100 ký tự"));
    return Promise.resolve();
  };

  // Validator: Địa chỉ tối thiểu 5 ký tự
  const addressValidator = (_, value) => {
    const v = trimSafe(value) || "";
    if (!v) return Promise.reject(new Error("Vui lòng nhập địa chỉ"));
    if (v.length < 5)
      return Promise.reject(new Error("Địa chỉ tối thiểu 5 ký tự"));
    if (v.length > 200)
      return Promise.reject(new Error("Địa chỉ tối đa 200 ký tự"));
    return Promise.resolve();
  };

  // Validator: Số điện thoại Việt Nam (0XXXXXXXXX hoặc +84XXXXXXXXX)
  const phoneValidator = (_, value) => {
    const raw = typeof value === "string" ? value : "";
    const v = raw.replace(/[\s-]/g, "");
    if (!v) return Promise.reject(new Error("Vui lòng nhập số điện thoại"));
    const ok = /^(?:0\d{9}|\+84\d{9})$/.test(v);
    if (!ok)
      return Promise.reject(
        new Error(
          "Số điện thoại không hợp lệ (vd: 0912345678 hoặc +84912345678)"
        )
      );
    return Promise.resolve();
  };

  // Options: Khu vực Việt Nam
  const regionOptions = [
    { label: "Miền Bắc", value: "NORTH" },
    { label: "Miền Trung", value: "CENTRAL" },
    { label: "Miền Nam", value: "SOUTH" },
  ];

  const regionLabel = (value) =>
    regionOptions.find((o) => o.value === value)?.label || value || "-";

  // Helper: bỏ dấu tiếng Việt để tìm kiếm dễ hơn
  const stripVN = (s = "") =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Fetch danh sách đại lý
  const fetchDealers = async (statusKey) => {
    setLoading(true);
    try {
      const params = {};
      if (statusKey) params.status = statusKey; // kỳ vọng BE hỗ trợ ?status=ALL|ACTIVE|INACTIVE
      const res = await api.get(
        "dealers",
        Object.keys(params).length ? { params } : undefined
      ); // GET /api/dealers
      const payload = res.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.content)) list = payload.content; // in case of Page
      setDealers(list);
    } catch (err) {
      console.error("Fetch dealers failed", err);
      message.error(
        err.response?.data?.message || "Không tải được danh sách đại lý"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  const showAddModal = () => {
    form.resetFields();
    setModalMode("create");
    setCurrentDealerId(null);
    setIsModalVisible(true);
  };

  const showEditModal = async (record) => {
    setModalMode("edit");
    setCurrentDealerId(record.id);
    try {
      // lấy chi tiết để đảm bảo dữ liệu đầy đủ/đồng bộ
      const res = await api.get(`dealers/${record.id}`);
      const payload = res.data;
      const d = payload?.data ?? payload;
      form.setFieldsValue({
        name: d?.name ?? record.name,
        address: d?.address ?? record.address,
        phoneNumber: d?.phoneNumber ?? record.phoneNumber,
        email: d?.email ?? record.email,
        region: d?.region ?? record.region ?? undefined,
        levelNumber: d?.levelNumber,
      });
    } catch (e) {
      console.error("Fetch dealer detail for edit failed", e);
      // nếu lỗi, vẫn set tạm theo record
      form.setFieldsValue({
        name: record.name,
        address: record.address,
        phoneNumber: record.phoneNumber,
        email: record.email,
        region: record.region,
        levelNumber: record.levelNumber,
      });
    }
    setIsModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: trimSafe(values.name),
        address: trimSafe(values.address),
        phoneNumber: (values.phoneNumber || "").replace(/[\s-]/g, ""),
        email: trimSafe(values.email),
        region: values.region || "",
        isActive: true,
      };
      if (values.levelNumber !== undefined && values.levelNumber !== null) {
        payload.levelNumber = values.levelNumber;
      }
      if (modalMode === "create") {
        const res = await api.post("dealers", payload); // POST /api/dealers
        if (res.data?.success !== false) {
          message.success(res.data?.message || "Tạo đại lý thành công");
          setIsModalVisible(false);
          form.resetFields();
          fetchDealers();
        }
      } else {
        const res = await api.put(`dealers/${currentDealerId}`, payload); // PUT /api/dealers/{dealerId}
        if (res.data?.success !== false) {
          message.success(res.data?.message || "Cập nhật đại lý thành công");
          setIsModalVisible(false);
          form.resetFields();
          fetchDealers();
        }
      }
    } catch (err) {
      if (err?.errorFields) return; // validation error
      console.error("Submit dealer failed", err);
      const defaultMsg =
        modalMode === "create"
          ? "Tạo đại lý thất bại"
          : "Cập nhật đại lý thất bại";
      message.error(err.response?.data?.message || defaultMsg);
    }
  };

  // Xem chi tiết đại lý
  const handleViewDetails = async (record) => {
    setIsDetailVisible(true);
    setDetailLoading(true);
    setDetailDealer(null);
    try {
      const res = await api.get(`dealers/${record.id}`); // GET /api/dealers/{dealerId}
      const payload = res.data;
      const detail = payload?.data ?? payload; // support both shapes
      setDetailDealer(detail);
    } catch (err) {
      console.error("Fetch dealer detail failed", err);
      message.error(
        err.response?.data?.message || "Không tải được chi tiết đại lý"
      );
    } finally {
      setDetailLoading(false);
    }
  };

  // Bật/tắt trạng thái hoạt động
  const handleToggleActive = async (record, nextActive) => {
    // đánh dấu loading theo id
    setTogglingIds((prev) => new Set(prev).add(record.id));
    try {
      const url = `dealers/${record.id}/${
        nextActive ? "activate" : "deactivate"
      }`;
      // PATCH theo swagger; gửi body rỗng để đảm bảo Content-Type application/json
      const res = await api.patch(url, {});
      if (res.data?.success === false) {
        throw new Error(res.data?.message || "Thao tác thất bại");
      }
      // cập nhật danh sách
      setDealers((prev) =>
        prev.map((d) =>
          d.id === record.id ? { ...d, isActive: nextActive } : d
        )
      );
      // cập nhật modal chi tiết nếu đang mở
      setDetailDealer((prev) =>
        prev && prev.id === record.id ? { ...prev, isActive: nextActive } : prev
      );
      message.success(nextActive ? "Đã bật hoạt động" : "Đã tắt hoạt động");
    } catch (err) {
      console.error("Toggle active failed", err?.response || err);
      message.error(
        err.response?.data?.message ||
          (nextActive ? "Bật hoạt động thất bại" : "Tắt hoạt động thất bại")
      );
    } finally {
      setTogglingIds((prev) => {
        const n = new Set(prev);
        n.delete(record.id);
        return n;
      });
    }
  };

  const columns = [
    { title: "Tên đại lý", dataIndex: "name", key: "name" },
    { title: "Địa chỉ", dataIndex: "address", key: "address" },
    { title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Khu vực",
      dataIndex: "region",
      key: "region",
      render: (v) => regionLabel(v),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, record) => (
        <Space size="small">
          <Tag color={isActive ? "green" : "default"}>
            {isActive ? "Hoạt động" : "Ngừng"}
          </Tag>
          <Switch
            size="small"
            checked={!!isActive}
            loading={togglingIds.has(record.id)}
            onChange={(checked) => handleToggleActive(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  // Dữ liệu sau khi áp dụng tìm kiếm & lọc (client-side)
  const filteredDealers = dealers.filter((d) => {
    // Lọc theo khu vực
    if (filterRegion && d.region !== filterRegion) return false;
    // Lọc theo trạng thái
    if (typeof filterStatus === "boolean" && d.isActive !== filterStatus)
      return false;
    // Tìm kiếm văn bản
    const q = stripVN(searchText);
    if (!q) return true;
    const hay = [d.name, d.email, d.phoneNumber, d.address]
      .map((x) => stripVN(x))
      .join(" ");
    return hay.includes(q);
  });

  return (
    <Card
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          Quản lý đại lý
        </Typography.Title>
      }
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          Thêm đại lý
        </Button>
      }
    >
      {/* Thanh tìm kiếm & lọc */}
      <Space
        wrap
        style={{
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Input.Search
          allowClear
          placeholder="Tìm theo tên, email, SĐT, địa chỉ"
          style={{ width: 340 }}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Space wrap>
          <Select
            allowClear
            placeholder="Tải từ server theo trạng thái"
            style={{ width: 220 }}
            value={serverStatus}
            onChange={(val) => {
              setServerStatus(val);
              // Khi chọn lọc server, tải lại dữ liệu từ server
              fetchDealers(val);
              // Xóa lọc client-side để tránh nhầm
              setFilterStatus(undefined);
            }}
            options={[
              { label: "Tất cả (server)", value: "ALL" },
              { label: "Hoạt động (server)", value: "ACTIVE" },
              { label: "Ngừng (server)", value: "INACTIVE" },
            ]}
          />
          <Select
            allowClear
            options={regionOptions}
            placeholder="Lọc theo khu vực"
            style={{ width: 180 }}
            value={filterRegion}
            onChange={setFilterRegion}
          />
          <Select
            allowClear
            placeholder="Lọc theo trạng thái"
            style={{ width: 180 }}
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { label: "Hoạt động", value: true },
              { label: "Ngừng", value: false },
            ]}
          />
          <Button
            onClick={() => {
              setSearchText("");
              setFilterRegion(undefined);
              setFilterStatus(undefined);
              setServerStatus(undefined);
              fetchDealers();
            }}
          >
            Xóa lọc
          </Button>
        </Space>
      </Space>

      <Table
        columns={columns}
        dataSource={filteredDealers}
        rowKey="id"
        loading={loading}
      />

      <Modal
        open={isModalVisible}
        title={modalMode === "create" ? "Thêm đại lý" : "Cập nhật đại lý"}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSubmit}
        okText={modalMode === "create" ? "Tạo" : "Lưu"}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên đại lý"
            name="name"
            required
            rules={[{ validator: nameValidator }]}
          >
            <Input allowClear maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="address"
            required
            rules={[{ validator: addressValidator }]}
          >
            <Input allowClear maxLength={200} />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phoneNumber"
            required
            rules={[{ validator: phoneValidator }]}
          >
            <Input
              allowClear
              maxLength={14}
              placeholder="VD: 0912345678 hoặc +84912345678"
            />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            required
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              {
                type: "email",
                message: "Email không hợp lệ",
                transform: (v) => (typeof v === "string" ? v.trim() : v),
              },
            ]}
          >
            <Input allowClear maxLength={100} />
          </Form.Item>
          <Form.Item
            label="Cấp đại lý"
            name="levelNumber"
            rules={[
              {
                required: modalMode === "create",
                message: "Vui lòng chọn cấp đại lý",
              },
            ]}
          >
            <Select
              allowClear
              placeholder="Chọn cấp đại lý"
              options={[
                { label: "Cấp 1", value: 1 },
                { label: "Cấp 2", value: 2 },
                { label: "Cấp 3", value: 3 },
              ]}
            />
          </Form.Item>
          <Form.Item label="Khu vực" name="region">
            <Select
              allowClear
              options={regionOptions}
              placeholder="Chọn khu vực (tuỳ chọn)"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={isDetailVisible}
        title="Chi tiết đại lý"
        footer={null}
        onCancel={() => setIsDetailVisible(false)}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <Spin />
          </div>
        ) : detailDealer ? (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Mã">{detailDealer.id}</Descriptions.Item>
            <Descriptions.Item label="Tên đại lý">
              {detailDealer.name}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {detailDealer.address}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {detailDealer.phoneNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {detailDealer.email}
            </Descriptions.Item>
            {detailDealer.levelNumber !== undefined && (
              <Descriptions.Item label="Cấp đại lý">
                {detailDealer.levelNumber}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Khu vực">
              {regionLabel(detailDealer.region)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={detailDealer.isActive ? "green" : "default"}>
                {detailDealer.isActive ? "Hoạt động" : "Ngừng"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <div>Không có dữ liệu chi tiết.</div>
        )}
      </Modal>
    </Card>
  );
};

export default DealerManagement;
