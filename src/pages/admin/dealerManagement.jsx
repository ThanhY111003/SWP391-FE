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
  Typography,
  Select,
  Switch,
  Tooltip,
  Descriptions,
  Spin,
} from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined } from "@ant-design/icons";
import api from "../../config/axios";

const DealerManagement = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(false);
  // Dealer Levels
  const [dealerLevels, setDealerLevels] = useState([]);
  const [levelsLoading, setLevelsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [currentDealerId, setCurrentDealerId] = useState(null);
  // State cho modal chi tiết
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailDealer, setDetailDealer] = useState(null);
  const [form] = Form.useForm();
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [messageApi, contextHolder] = message.useMessage();

  // Tìm kiếm & lọc
  const [searchText, setSearchText] = useState("");
  const [filterRegion, setFilterRegion] = useState();
  const [filterStatus, setFilterStatus] = useState(); // true | false | undefined
  const [filterLevelNumber, setFilterLevelNumber] = useState(); // cấp đại lý

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

  // Helper: hiển thị nhãn cấp từ id hoặc levelNumber
  const levelLabelBy = ({ id, levelNumber }) => {
    if (id != null) {
      const lv = dealerLevels.find((x) => x.id === id);
      if (lv)
        return (
          (lv.levelNumber ? `Cấp ${lv.levelNumber}` : "Cấp") +
          (lv.levelName ? ` - ${lv.levelName}` : "")
        );
    }
    if (levelNumber != null) {
      const lv = dealerLevels.find((x) => x.levelNumber === levelNumber);
      if (lv)
        return (
          (lv.levelNumber ? `Cấp ${lv.levelNumber}` : "Cấp") +
          (lv.levelName ? ` - ${lv.levelName}` : "")
        );
      return levelNumber;
    }
    return "-";
  };

  // Helper: bỏ dấu tiếng Việt để tìm kiếm dễ hơn
  const stripVN = (s = "") =>
    (s || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Fetch danh sách đại lý
  const fetchDealers = async () => {
    setLoading(true);
    try {
      const res = await api.get("dealers"); // GET /api/dealers (FE sẽ tự filter)
      const payload = res.data;
      let list = [];
      if (Array.isArray(payload)) list = payload;
      else if (Array.isArray(payload?.data)) list = payload.data;
      else if (Array.isArray(payload?.content)) list = payload.content; // in case of Page
      setDealers(list);
    } catch (err) {
      console.error("Fetch dealers failed", err);
      messageApi.error(
        err.response?.data?.message || "Không tải được danh sách đại lý"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
    // Tải sẵn danh sách cấp ngay khi vào trang để đảm bảo mở modal là có dữ liệu
    fetchDealerLevels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Dealer Levels (dynamic — để hãng sửa là FE thấy ngay)
  const fetchDealerLevels = async () => {
    setLevelsLoading(true);
    try {
      // Ưu tiên endpoint bạn yêu cầu: /api/dealer-levels. Nếu không có dữ liệu, fallback sang /dealer-levels/all
      let res = await api.get("dealer-levels"); // GET /api/dealer-levels
      let payload = res.data;
      let list = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];
      if (!list.length) {
        // Fallback sang /all nếu endpoint đầu tiên trả rỗng/không như kỳ vọng
        try {
          res = await api.get("dealer-levels/all"); // GET /api/dealer-levels/all
          payload = res.data;
          list = Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload)
            ? payload
            : [];
        } catch {
          // bỏ qua, lỗi sẽ được catch bên ngoài
        }
      }
      // sort theo levelNumber tăng dần để hiển thị có thứ tự
      list.sort((a, b) => (a.levelNumber ?? 0) - (b.levelNumber ?? 0));
      setDealerLevels(list);
    } catch (e) {
      console.error("Fetch dealer levels failed", e);
      message.error(
        e.response?.data?.message || "Không tải được danh sách cấp đại lý"
      );
    } finally {
      setLevelsLoading(false);
    }
  };

  const showAddModal = () => {
    setModalMode("create");
    setCurrentDealerId(null);
    // Luôn gọi để cập nhật mới nhất từ server
    fetchDealerLevels();
    setIsModalVisible(true);
    // Đợi Form mount trong Modal rồi mới reset để tránh cảnh báo useForm
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  const showEditModal = async (record) => {
    setModalMode("edit");
    setCurrentDealerId(record.id);
    // Mở modal trước để đảm bảo Form đã gắn kết với instance
    setIsModalVisible(true);
    // Đảm bảo danh sách cấp đại lý đã sẵn sàng để map dealerLevelId -> levelNumber
    try {
      await fetchDealerLevels();
    } catch (e) {
      // không chặn mở modal nếu lỗi, chỉ log cảnh báo
      console.warn("fetchDealerLevels before edit failed", e);
    }
    try {
      const res = await api.get(`dealers/${record.id}`);
      const payload = res.data;
      const d = payload?.data ?? payload;
      const findLevelNumber = (obj) => {
        if (!obj) return undefined;
        if (obj.levelNumber != null) return obj.levelNumber;
        if (obj.dealerLevelId != null) {
          const lv = dealerLevels.find((x) => x.id === obj.dealerLevelId);
          if (lv && lv.levelNumber != null) return lv.levelNumber;
        }
        return undefined;
      };
      const levelNumberInit =
        findLevelNumber(d) ?? findLevelNumber(record) ?? undefined;
      form.setFieldsValue({
        name: d?.name ?? record.name,
        address: d?.address ?? record.address,
        phoneNumber: d?.phoneNumber ?? record.phoneNumber,
        email: d?.email ?? record.email,
        region: d?.region ?? record.region ?? undefined,
        levelNumber: levelNumberInit,
      });
    } catch (e) {
      console.error("Fetch dealer detail for edit failed", e);
      const findLevelNumber = (obj) => {
        if (!obj) return undefined;
        if (obj.levelNumber != null) return obj.levelNumber;
        if (obj.dealerLevelId != null) {
          const lv = dealerLevels.find((x) => x.id === obj.dealerLevelId);
          if (lv && lv.levelNumber != null) return lv.levelNumber;
        }
        return undefined;
      };
      form.setFieldsValue({
        name: record.name,
        address: record.address,
        phoneNumber: record.phoneNumber,
        email: record.email,
        region: record.region,
        levelNumber: findLevelNumber(record),
      });
    }
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
        const key = "dealer-save";
        messageApi.loading({ content: "Đang tạo...", key });
        const res = await api.post("dealers", payload); // POST /api/dealers
        if (res.data?.success !== false) {
          messageApi.success({
            content: res.data?.message || "Tạo đại lý thành công",
            key,
          });
          setIsModalVisible(false);
          form.resetFields();
          fetchDealers();
        }
      } else {
        const key = "dealer-save";
        messageApi.loading({ content: "Đang lưu...", key });
        const res = await api.put(`dealers/${currentDealerId}`, payload); // PUT /api/dealers/{dealerId}
        if (res.data?.success !== false) {
          messageApi.success({
            content: res.data?.message || "Cập nhật đại lý thành công",
            key,
          });
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
      messageApi.error(err.response?.data?.message || defaultMsg);
    }
  };

  // Xem chi tiết đại lý
  const handleViewDetails = async (record) => {
    setIsDetailVisible(true);
    setDetailLoading(true);
    setDetailDealer(null);
    try {
      const res = await api.get(`dealers/${record.id}`);
      const payload = res.data;
      const detail = payload?.data ?? payload;
      setDetailDealer(detail);
    } catch (err) {
      console.error("Fetch dealer detail failed", err);
      messageApi.error(
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
      const key = `dealer-toggle-${record.id}`;
      messageApi.loading({ content: "Đang cập nhật trạng thái...", key });
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
      // modal chi tiết đã ẩn nên không cần đồng bộ thêm
      messageApi.success({
        content: nextActive ? "Đã bật hoạt động" : "Đã tắt hoạt động",
        key,
      });
    } catch (err) {
      console.error("Toggle active failed", err?.response || err);
      messageApi.error(
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

  // Lấy levelNumber hiển thị cho 1 dòng record
  const resolveLevelNumber = (record) => {
    if (record.levelNumber != null) return record.levelNumber;
    if (record.dealerLevelId != null) {
      const lv = dealerLevels.find((x) => x.id === record.dealerLevelId);
      if (lv && lv.levelNumber != null) return lv.levelNumber;
    }
    return undefined;
  };

  const columns = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_v, _r, index) => index + 1,
    },
    { title: "Tên đại lý", dataIndex: "name", key: "name" },
    {
      title: "Cấp đại lý",
      key: "dealerLevel",
      render: (_, record) =>
        levelLabelBy({
          id: record.dealerLevelId,
          levelNumber: record.levelNumber,
        }),
    },
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
      width: 220,
      render: (isActive, record) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            whiteSpace: "nowrap",
          }}
        >
          <div style={{ width: 96, display: "flex", justifyContent: "center" }}>
            <Tag color={isActive ? "green" : "default"} style={{ margin: 0 }}>
              {isActive ? "Hoạt động" : "Ngừng"}
            </Tag>
          </div>
          <Switch
            size="small"
            checked={!!isActive}
            loading={togglingIds.has(record.id)}
            onChange={(checked) => handleToggleActive(record, checked)}
          />
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
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
    // Lọc theo cấp đại lý
    if (
      filterLevelNumber != null &&
      resolveLevelNumber(d) !== filterLevelNumber
    )
      return false;
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
      {contextHolder}
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
            options={regionOptions}
            placeholder="Lọc theo khu vực"
            style={{ width: 180 }}
            value={filterRegion}
            onChange={setFilterRegion}
          />
          <Select
            allowClear
            placeholder="Lọc theo cấp đại lý"
            style={{ width: 200 }}
            value={filterLevelNumber}
            onChange={setFilterLevelNumber}
            loading={levelsLoading}
            options={dealerLevels.map((lv) => ({
              label:
                (lv.levelNumber ? `Cấp ${lv.levelNumber}` : "Cấp") +
                (lv.levelName ? ` - ${lv.levelName}` : ""),
              value: lv.levelNumber,
            }))}
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
              setFilterLevelNumber(undefined);
              setFilterStatus(undefined);
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
              loading={levelsLoading}
              placeholder="Chọn cấp đại lý"
              notFoundContent={
                levelsLoading ? "Đang tải..." : "Không có dữ liệu"
              }
              options={dealerLevels.map((lv) => ({
                label:
                  (lv.levelNumber ? `Cấp ${lv.levelNumber}` : "Cấp") +
                  (lv.levelName ? ` - ${lv.levelName}` : ""),
                value: lv.levelNumber,
              }))}
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
            {(detailDealer.dealerLevelId !== undefined ||
              detailDealer.levelNumber !== undefined) && (
              <Descriptions.Item label="Cấp đại lý">
                {levelLabelBy({
                  id: detailDealer.dealerLevelId,
                  levelNumber: detailDealer.levelNumber,
                })}
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
