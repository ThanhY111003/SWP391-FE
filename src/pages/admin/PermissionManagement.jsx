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
  Checkbox,
  Divider,
  Tag,
  Table,
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
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [permissionCatalog, setPermissionCatalog] =
    useState(PERMISSION_CATALOG);
  const [actionsByModule, setActionsByModule] = useState(null);
  const [keyToPermissionId, setKeyToPermissionId] = useState({});

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

        const moduleSet = new Set();
        const actionsMap = {};
        const keyIdMap = {};

        for (const p of list) {
          const resource = normalizeResource(p.resource);
          const action = normalizeAction(p.action);
          const active = p.isActive !== false; // treat undefined as active
          if (!active) continue;

          moduleSet.add(resource);
          if (!actionsMap[resource]) actionsMap[resource] = new Set();
          actionsMap[resource].add(action);
          keyIdMap[`${resource}:${action}`] = p.id;
        }

        // Build catalog from modules (preserve known order by using PERMISSION_CATALOG as guide)
        const knownOrder = PERMISSION_CATALOG.map((m) => m.key);
        const modules = Array.from(moduleSet);
        modules.sort((a, b) => {
          const ia = knownOrder.indexOf(a);
          const ib = knownOrder.indexOf(b);
          if (ia === -1 && ib === -1) return a.localeCompare(b);
          if (ia === -1) return 1;
          if (ib === -1) return -1;
          return ia - ib;
        });

        const catalog = modules.map((m) => ({
          key: m,
          label: MODULE_LABEL_MAP[m] || m,
          icon: MODULE_ICON_MAP[m] || <SafetyCertificateOutlined />,
        }));

        const actionsByMod = {};
        for (const m of modules) {
          const acts = Array.from(actionsMap[m] || []);
          actionsByMod[m] = acts.map((k) => ({
            key: k,
            label: ACTION_LABEL_MAP[k] || k,
          }));
        }

        setPermissionCatalog(catalog);
        setActionsByModule(actionsByMod);
        setKeyToPermissionId(keyIdMap);
      }
    } catch {
      // ignore, fallback to static catalog
    }
  };

  const fetchRolePermissions = async (roleId) => {
    setLoadingPerms(true);
    try {
      // Use role detail API: GET /roles/{id}
      const res = await api.get(`/roles/${roleId}`);
      if (res?.data?.success) {
        const detail = res.data.data || {};
        const perms = Array.isArray(detail.permissions)
          ? detail.permissions
          : [];
        const keysRaw = new Set();
        const unionActions = { ...(actionsByModule || {}) };
        for (const p of perms) {
          const resource = normalizeResource(p.resource);
          const action = normalizeAction(p.action);
          keysRaw.add(`${resource}:${action}`);
          // Ensure current role's actions are visible even if not in global catalog
          if (!unionActions[resource]) unionActions[resource] = [];
          if (!unionActions[resource].some((a) => (a.key || a) === action)) {
            unionActions[resource] = [
              ...unionActions[resource],
              { key: action, label: ACTION_LABEL_MAP[action] || action },
            ];
          }
        }
        if (actionsByModule) setActionsByModule(unionActions);
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
    } finally {
      setLoadingPerms(false);
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

  const togglePermission = (permKey, checked) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      if (checked) next.add(permKey);
      else next.delete(permKey);
      return next;
    });
  };

  const toggleModuleAll = (moduleKey, checked) => {
    setRolePerms((prev) => {
      const next = new Set(prev);
      const acts =
        actionsByModule?.[moduleKey] ||
        ACTIONS.filter((a) => !(a.optional && !["orders"].includes(moduleKey)));
      for (const act of acts) {
        const key = act.key || act; // support both object and string
        const k = `${moduleKey}:${key}`;
        if (checked) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  };

  const setModulePreset = (moduleKey, preset) => {
    // presets: all | view-only | none
    setRolePerms((prev) => {
      const next = new Set(prev);
      // clear all of module first
      const clearActs =
        actionsByModule?.[moduleKey] ||
        ACTIONS.filter((a) => !(a.optional && !["orders"].includes(moduleKey)));
      for (const act of clearActs) {
        const key = act.key || act;
        next.delete(`${moduleKey}:${key}`);
      }
      if (preset === "all") {
        for (const act of clearActs) {
          const key = act.key || act;
          next.add(`${moduleKey}:${key}`);
        }
      } else if (preset === "view-only") {
        next.add(`${moduleKey}:view`);
      }
      return next;
    });
  };

  const columns = [
    {
      title: "Module",
      dataIndex: "label",
      key: "label",
      width: 220,
      render: (_, record) => (
        <Space>
          {record.icon}
          <Text strong>{record.label}</Text>
        </Space>
      ),
    },
    {
      title: "Quyền",
      key: "actions",
      render: (_, record) => {
        const acts =
          actionsByModule?.[record.key] ||
          ACTIONS.filter(
            (a) => !(a.optional && !["orders"].includes(record.key))
          );
        return (
          <Space wrap size="middle">
            {acts.map((a) => {
              const actionKey = a.key || a;
              const label = a.label || ACTION_LABEL_MAP[actionKey] || actionKey;
              const permKey = `${record.key}:${actionKey}`;
              const checked = rolePerms.has(permKey);
              return (
                <Checkbox
                  key={permKey}
                  checked={checked}
                  onChange={(e) => togglePermission(permKey, e.target.checked)}
                >
                  {label}
                </Checkbox>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: "Tùy chọn nhanh",
      key: "quick",
      width: 260,
      render: (_, record) => {
        const acts =
          actionsByModule?.[record.key] ||
          ACTIONS.filter(
            (a) => !(a.optional && !["orders"].includes(record.key))
          );
        const allChecked = acts.every((a) => {
          const k = a.key || a;
          return rolePerms.has(`${record.key}:${k}`);
        });
        const someChecked =
          !allChecked &&
          acts.some((a) => {
            const k = a.key || a;
            return rolePerms.has(`${record.key}:${k}`);
          });
        return (
          <Space wrap>
            <Checkbox
              indeterminate={someChecked && !allChecked}
              checked={allChecked}
              onChange={(e) => toggleModuleAll(record.key, e.target.checked)}
            >
              Chọn tất cả
            </Checkbox>
            <Button
              size="small"
              onClick={() => setModulePreset(record.key, "view-only")}
            >
              Chỉ xem
            </Button>
            <Button
              size="small"
              onClick={() => setModulePreset(record.key, "none")}
            >
              Bỏ chọn
            </Button>
          </Space>
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
            <Table
              rowKey={(r) => r.key}
              dataSource={permissionCatalog}
              columns={columns}
              pagination={false}
              loading={loadingPerms}
            />
            <Divider />
            <Space>
              <Button onClick={() => setRolePerms(new Set())}>
                Bỏ chọn tất cả
              </Button>
              <Button
                onClick={() => {
                  const s = new Set();
                  const modules = permissionCatalog?.length
                    ? permissionCatalog
                    : PERMISSION_CATALOG;
                  for (const mod of modules) {
                    const acts =
                      actionsByModule?.[mod.key] ||
                      ACTIONS.filter(
                        (a) => !(a.optional && !["orders"].includes(mod.key))
                      );
                    for (const a of acts) {
                      const key = a.key || a;
                      s.add(`${mod.key}:${key}`);
                    }
                  }
                  setRolePerms(s);
                }}
              >
                Chọn tất cả
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                onClick={savePermissions}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
