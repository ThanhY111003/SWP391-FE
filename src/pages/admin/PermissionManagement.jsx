import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  List,
  Input,
  Space,
  Button,
  Divider,
  Tag,
  Table,
  Checkbox,
  Switch,
  message,
  Popconfirm,
} from "antd";
import {
  SafetyCertificateOutlined,
  TeamOutlined,
  FileTextOutlined,
  UserOutlined,
  BgColorsOutlined,
  CarOutlined,
  DollarCircleOutlined,
  CrownOutlined,
  LockOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Title, Text } = Typography;

// Static permission catalog (modules + actions)
const PERMISSION_CATALOG = [
  { key: "dealers", label: "Đại lý", icon: <TeamOutlined /> },
  { key: "users", label: "Người dùng", icon: <UserOutlined /> },
  { key: "orders", label: "Đơn hàng", icon: <FileTextOutlined /> },
  { key: "vehicle-models", label: "Model xe", icon: <CarOutlined /> },
  { key: "colors", label: "Màu sắc", icon: <BgColorsOutlined /> },
  { key: "dealer-levels", label: "Cấp đại lý", icon: <CrownOutlined /> },
  { key: "price-table", label: "Bảng giá", icon: <DollarCircleOutlined /> },
  {
    key: "permissions",
    label: "Phân quyền",
    icon: <SafetyCertificateOutlined />,
  },
];

const ACTIONS = [
  { key: "view", label: "Xem" },
  { key: "create", label: "Tạo" },
  { key: "update", label: "Sửa" },
  { key: "delete", label: "Xóa" },
  { key: "approve", label: "Duyệt", optional: true },
];

// Maps to support dynamic catalog
const MODULE_ICON_MAP = {
  dealers: <TeamOutlined />,
  users: <UserOutlined />,
  orders: <FileTextOutlined />,
  "vehicle-models": <CarOutlined />,
  colors: <BgColorsOutlined />,
  "dealer-levels": <CrownOutlined />,
  "price-table": <DollarCircleOutlined />,
  permissions: <SafetyCertificateOutlined />,
};

const MODULE_LABEL_MAP = {
  dealers: "Đại lý",
  users: "Người dùng",
  orders: "Đơn hàng",
  "vehicle-models": "Model xe",
  colors: "Màu sắc",
  "dealer-levels": "Cấp đại lý",
  "price-table": "Bảng giá",
  permissions: "Phân quyền",
};

const ACTION_LABEL_MAP = {
  view: "Xem",
  create: "Tạo",
  update: "Sửa",
  delete: "Xóa",
  approve: "Duyệt",
};

// Build all permission keys like `${module}:${action}`
const buildAllPermissions = () => {
  const keys = [];
  for (const mod of PERMISSION_CATALOG) {
    for (const action of ACTIONS) {
      // Some modules may not need approve
      if (action.optional && !["orders"].includes(mod.key)) continue;
      keys.push(`${mod.key}:${action.key}`);
    }
  }
  return keys;
};

export default function PermissionManagement() {
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [search, setSearch] = useState("");
  const [rolePerms, setRolePerms] = useState(new Set());
  const [originalPerms, setOriginalPerms] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  // Removed dynamic module catalog (tree view) — flat permissions list is enough
  const [keyToPermissionId, setKeyToPermissionId] = useState({});
  const [rawPermissions, setRawPermissions] = useState([]); // flat list of all active permissions
  const [permissionSearch, setPermissionSearch] = useState("");
  const [permPage, setPermPage] = useState(1); // current page for STT numbering
  const [showSelectedOnly, setShowSelectedOnly] = useState(false); // filter to only permissions currently granted

  // Derived
  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    return roles.filter((r) =>
      `${r.name} ${r.code}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const allPermissionKeys = useMemo(() => buildAllPermissions(), []);

  // Chuẩn hóa tên resource và action từ backend sang key FE đang dùng
  const normalizeResource = (resourceRaw) => {
    const r = (resourceRaw || "").toString().trim().toLowerCase();
    const aliases = {
      dealers: "dealers",
      dealer: "dealers",
      users: "users",
      user: "users",
      orders: "orders",
      order: "orders",
      "vehicle-models": "vehicle-models",
      vehicle_models: "vehicle-models",
      vehiclemodels: "vehicle-models",
      "vehicle-model": "vehicle-models",
      vehicle_model: "vehicle-models",
      colors: "colors",
      color: "colors",
      "dealer-levels": "dealer-levels",
      dealer_levels: "dealer-levels",
      dealerlevels: "dealer-levels",
      "price-table": "price-table",
      price_table: "price-table",
      pricetable: "price-table",
      permissions: "permissions",
      permission: "permissions",
    };
    const key = r.replace(/\s+/g, "-").replace(/_/g, "-");
    return aliases[key] || key;
  };

  const normalizeAction = (actionRaw) => {
    const a = (actionRaw || "").toString().trim().toLowerCase();
    const map = {
      read: "view",
      view: "view",
      create: "create",
      add: "create",
      update: "update",
      edit: "update",
      delete: "delete",
      remove: "delete",
      approve: "approve",
      authorization: "approve",
    };
    return map[a] || a;
  };

  const fetchRoles = async () => {
    setRolesLoading(true);
    try {
      // Use provided API to get roles (axios baseURL is '/api/', so path here is '/roles')
      const res = await api.get("/roles");
      if (res?.data?.success) {
        const list = (res.data.data || []).map((r) => ({
          id: r.id,
          // displayName is human-readable; backend 'name' is the system code
          name: r.displayName || r.name,
          code: r.name,
          description: r.description,
          isCustomized: r.isCustomized,
        }));
        setRoles(list);
        if (!selectedRole && list.length) setSelectedRole(list[0]);
      } else {
        // Fallback sample if API returns success=false
        const sample = [
          { id: 1, name: "Admin", code: "ADMIN" },
          { id: 2, name: "Quản lý", code: "MANAGER" },
          { id: 3, name: "Nhân viên", code: "STAFF" },
          { id: 4, name: "Đại lý", code: "DEALER" },
        ];
        setRoles(sample);
        if (!selectedRole) setSelectedRole(sample[0]);
        messageApi.info(
          "Đang dùng dữ liệu mẫu vai trò (API /api/roles trả về không hợp lệ)"
        );
      }
    } catch {
      const sample = [
        { id: 1, name: "Admin", code: "ADMIN" },
        { id: 2, name: "Quản lý", code: "MANAGER" },
        { id: 3, name: "Nhân viên", code: "STAFF" },
        { id: 4, name: "Đại lý", code: "DEALER" },
      ];
      setRoles(sample);
      if (!selectedRole) setSelectedRole(sample[0]);
      messageApi.info("Đang dùng dữ liệu mẫu vai trò (lỗi gọi API /api/roles)");
    } finally {
      setRolesLoading(false);
    }
  };

  const fetchAllPermissions = async () => {
    try {
      const res = await api.get("/roles/permissions");
      if (res?.data?.success) {
        const list = Array.isArray(res.data.data) ? res.data.data : [];

        const keyIdMap = {};
        const flat = [];
        const seen = new Set();

        for (const p of list) {
          const resource = normalizeResource(p.resource);
          const action = normalizeAction(p.action);
          const active = p.isActive !== false;
          if (!active) continue;
          const key = `${resource}:${action}`;
          // Skip duplicates after normalization (backend may have multiple aliases for same logical permission)
          if (seen.has(key)) {
            // If first record lacked description but this one has, update existing flat item
            const existingIndex = flat.findIndex((item) => item.key === key);
            if (
              existingIndex !== -1 &&
              !flat[existingIndex].description &&
              p.description
            ) {
              flat[existingIndex].description = p.description;
            }
            continue;
          }
          seen.add(key);
          keyIdMap[key] = p.id; // latest id kept (first occurrence)
          flat.push({
            id: p.id,
            key,
            resource,
            action,
            name: p.name,
            displayName: p.displayName,
            description: p.description,
            isActive: active,
          });
        }

        // Optional: sort for stable order (module then action then description)
        flat.sort((a, b) => {
          if (a.resource !== b.resource)
            return a.resource.localeCompare(b.resource);
          if (a.action !== b.action) return a.action.localeCompare(b.action);
          return (a.description || "").localeCompare(b.description || "");
        });

        setKeyToPermissionId(keyIdMap);
        setRawPermissions(flat);
      }
    } catch {
      // ignore
    }
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      // Use role detail API: GET /roles/{id}
      const res = await api.get(`/roles/${roleId}`);
      if (res?.data?.success) {
        const detail = res.data.data || {};
        const perms = Array.isArray(detail.permissions)
          ? detail.permissions
          : [];
        const keysRaw = new Set();
        for (const p of perms) {
          const resource = normalizeResource(p.resource);
          const action = normalizeAction(p.action);
          keysRaw.add(`${resource}:${action}`);
        }
        setRolePerms(keysRaw);
        setOriginalPerms(new Set(Array.from(keysRaw)));
      } else {
        // Fallback sample
        const samplePerms = new Set();
        if (selectedRole?.code === "ADMIN") {
          allPermissionKeys.forEach((k) => samplePerms.add(k));
        } else if (selectedRole?.code === "MANAGER") {
          [
            "dealers:view",
            "users:view",
            "orders:view",
            "orders:approve",
            "vehicle-models:view",
            "colors:view",
            "price-table:view",
          ].forEach((k) => samplePerms.add(k));
        } else if (selectedRole?.code === "STAFF") {
          ["orders:view", "vehicle-models:view", "colors:view"].forEach((k) =>
            samplePerms.add(k)
          );
        } else if (selectedRole?.code === "DEALER") {
          [
            "orders:view",
            "orders:create",
            "orders:update",
            "vehicle-models:view",
            "colors:view",
            "price-table:view",
          ].forEach((k) => samplePerms.add(k));
        }
        setRolePerms(samplePerms);
        setOriginalPerms(new Set(Array.from(samplePerms)));
        messageApi.info(
          "Đang dùng dữ liệu mẫu phân quyền (API /roles/{id} không trả về permissions)"
        );
      }
    } catch {
      const samplePerms = new Set();
      if (selectedRole?.code === "ADMIN") {
        allPermissionKeys.forEach((k) => samplePerms.add(k));
      } else if (selectedRole?.code === "MANAGER") {
        [
          "dealers:view",
          "users:view",
          "orders:view",
          "orders:approve",
          "vehicle-models:view",
          "colors:view",
          "price-table:view",
        ].forEach((k) => samplePerms.add(k));
      } else if (selectedRole?.code === "STAFF") {
        ["orders:view", "vehicle-models:view", "colors:view"].forEach((k) =>
          samplePerms.add(k)
        );
      } else if (selectedRole?.code === "DEALER") {
        [
          "orders:view",
          "orders:create",
          "orders:update",
          "vehicle-models:view",
          "colors:view",
          "price-table:view",
        ].forEach((k) => samplePerms.add(k));
      }
      setRolePerms(samplePerms);
    }
  };

  const savePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      // Compute diffs vs original
      const currentKeys = new Set(rolePerms);
      const baseline = new Set(originalPerms);
      const added = Array.from(currentKeys).filter((k) => !baseline.has(k));
      const removed = Array.from(baseline).filter((k) => !currentKeys.has(k));

      if (added.length === 0 && removed.length === 0) {
        messageApi.info("Không có thay đổi để lưu");
        return;
      }

      const addIds = added.map((k) => keyToPermissionId[k]).filter(Boolean);
      const removeIds = removed
        .map((k) => keyToPermissionId[k])
        .filter(Boolean);

      // 1) Add
      if (addIds.length > 0) {
        const addRes = await api.post(
          `/roles/${selectedRole.id}/permissions/add`,
          { permissionIds: addIds }
        );
        if (!addRes?.data?.success) {
          // Fallback payloads
          const tryBodies = [
            addIds,
            { permissions: addIds },
            { permissions: added },
            added,
          ];
          let ok = false;
          for (const body of tryBodies) {
            try {
              const r = await api.post(
                `/roles/${selectedRole.id}/permissions/add`,
                body
              );
              if (r?.data?.success) {
                ok = true;
                break;
              }
            } catch {
              /* ignore fallback error */
            }
          }
          if (!ok) throw new Error("Add permissions failed");
        }
      }

      // 2) Remove
      if (removeIds.length > 0) {
        try {
          const delRes = await api.delete(
            `/roles/${selectedRole.id}/permissions/remove`,
            { data: { permissionIds: removeIds } }
          );
          if (!delRes?.data?.success) {
            const alt = await api.post(
              `/roles/${selectedRole.id}/permissions/remove`,
              { permissionIds: removeIds }
            );
            if (!alt?.data?.success)
              throw new Error("Remove permissions failed");
          }
        } catch {
          messageApi.warning(
            "Xóa quyền khỏi vai trò chưa thành công. Vui lòng kiểm tra API remove."
          );
        }
      }

      messageApi.success("Đã cập nhật quyền cho vai trò");
      // Refetch also resets originalPerms inside fetchRolePermissions
      await fetchRolePermissions(selectedRole.id);
    } catch {
      messageApi.info("API lưu chưa sẵn sàng, đã lưu mô phỏng trên giao diện");
    } finally {
      setSaving(false);
    }
  };

  const handleResetRolePermissions = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const res = await api.post(`/roles/${selectedRole.id}/reset`);
      if (res?.data?.success) {
        messageApi.success("Đã khôi phục quyền mặc định cho vai trò");
        await fetchRolePermissions(selectedRole.id);
      } else {
        messageApi.error(
          "Không thể khôi phục mặc định. Vui lòng kiểm tra API /roles/{id}/reset"
        );
      }
    } catch {
      messageApi.error("Gọi API reset thất bại");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAllPermissions();
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedRole?.id) {
      fetchRolePermissions(selectedRole.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole?.id]);

  // Old per-module quick toggles removed in Tree layout for simplicity.

  // NOTE: Previously used a Table with checkbox columns. Replaced by a Tree for clarity.

  // Filter + prepare flat permissions list for table
  const filteredPermissions = useMemo(() => {
    const q = permissionSearch.trim().toLowerCase();
    let base = rawPermissions;
    if (showSelectedOnly) {
      base = base.filter((p) => rolePerms.has(p.key));
    }
    if (!q) return base;
    return base.filter((p) => {
      const desc = (
        p.description ||
        p.displayName ||
        p.name ||
        ""
      ).toLowerCase();
      return (
        desc.includes(q) ||
        p.resource.toLowerCase().includes(q) ||
        p.action.toLowerCase().includes(q)
      );
    });
  }, [rawPermissions, permissionSearch, showSelectedOnly, rolePerms]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setPermPage(1);
  }, [permissionSearch, showSelectedOnly]);

  const permissionColumns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: "center",
      render: (_, __, index) => index + 1 + (permPage - 1) * 10,
    },
    {
      title: "Quyền (mô tả)",
      dataIndex: "description",
      key: "description",
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {record.description ||
              record.displayName ||
              record.name ||
              record.key}
          </Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.name}
          </Text>
        </Space>
      ),
    },
    {
      title: "Module",
      dataIndex: "resource",
      key: "resource",
      width: 140,
      render: (v) => (
        <Tag color="blue" style={{ margin: 0 }}>
          {MODULE_LABEL_MAP[v] || v}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      width: 120,
      render: (v) => <Tag color="geekblue">{ACTION_LABEL_MAP[v] || v}</Tag>,
    },
    {
      title: "Chọn",
      key: "checked",
      width: 100,
      render: (_, record) => {
        const checked = rolePerms.has(record.key);
        return (
          <Checkbox
            checked={checked}
            onChange={(e) => {
              const isChecked = e.target.checked;
              setRolePerms((prev) => {
                const next = new Set(prev);
                if (isChecked) next.add(record.key);
                else next.delete(record.key);
                return next;
              });
            }}
          />
        );
      },
    },
  ];

  return (
    <div>
      {contextHolder}
      <div className="flex items-center justify-between mb-4">
        <Title level={2} className="mb-0">
          <SafetyCertificateOutlined className="mr-2" /> Quản lý phân quyền
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() =>
              selectedRole && fetchRolePermissions(selectedRole.id)
            }
          >
            Tải quyền vai trò
          </Button>
          <Popconfirm
            title="Khôi phục quyền mặc định?"
            description="Thao tác này sẽ đưa quyền của vai trò về mặc định hệ thống. Bạn có chắc chắn?"
            okText="Có"
            cancelText="Không"
            onConfirm={handleResetRolePermissions}
            disabled={!selectedRole}
          >
            <Button danger>Khôi phục mặc định</Button>
          </Popconfirm>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={savePermissions}
          >
            Lưu thay đổi
          </Button>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card
            title="Vai trò"
            extra={
              <div style={{ display: "flex", alignItems: "center" }}>
                <Tag color="blue" style={{ margin: 0 }}>
                  {roles.length}
                </Tag>
              </div>
            }
            styles={{ body: { padding: 0 } }}
          >
            <div className="p-3">
              <Input.Search
                placeholder="Tìm vai trò..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                allowClear
              />
            </div>
            <div
              style={{
                maxHeight: 480,
                overflow: "auto",
                padding: "0 12px 12px",
              }}
            >
              <List
                loading={rolesLoading}
                itemLayout="horizontal"
                dataSource={filteredRoles}
                renderItem={(item) => {
                  const active = selectedRole?.id === item.id;
                  return (
                    <List.Item
                      onClick={() => setSelectedRole(item)}
                      style={{
                        cursor: "pointer",
                        background: active ? "#f0f5ff" : undefined,
                        alignItems: "center",
                        padding: "8px 12px",
                        borderRadius: 8,
                      }}
                    >
                      <List.Item.Meta
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <LockOutlined />
                            <Text strong>{item.name}</Text>
                            <Tag style={{ marginInlineStart: 4 }}>
                              {item.code}
                            </Tag>
                          </div>
                        }
                        description={
                          item.description ? (
                            <Text type="secondary">{item.description}</Text>
                          ) : null
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Card>
        </Col>
        <Col span={18}>
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined />
                <span>
                  Quyền của vai trò:{" "}
                  <Text strong>{selectedRole?.name || "(chưa chọn)"}</Text>
                </span>
                <Tag color="blue">{rolePerms.size}</Tag>
              </Space>
            }
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <Input.Search
                placeholder="Tìm mô tả, module hoặc hành động..."
                allowClear
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                style={{ maxWidth: 360 }}
              />
              <Space wrap>
                <Switch
                  checked={showSelectedOnly}
                  onChange={(v) => setShowSelectedOnly(v)}
                  size="small"
                />
                <span style={{ fontSize: 12, marginRight: 8 }}>
                  {showSelectedOnly ? "Chỉ quyền đã chọn" : "Tất cả quyền"}
                </span>
                <Button onClick={() => setRolePerms(new Set())}>
                  Bỏ chọn tất cả
                </Button>
                <Button
                  onClick={() => {
                    const s = new Set();
                    rawPermissions.forEach((p) => s.add(p.key));
                    setRolePerms(s);
                  }}
                >
                  Chọn tất cả
                </Button>
              </Space>
            </div>
            <Table
              size="small"
              rowKey={(r) => r.key}
              dataSource={filteredPermissions}
              columns={permissionColumns}
              pagination={{
                pageSize: 10,
                current: permPage,
                showSizeChanger: false,
                onChange: (p) => setPermPage(p),
                showTotal: (total) => `${total} quyền`,
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
