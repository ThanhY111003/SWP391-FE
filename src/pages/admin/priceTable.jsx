// src/pages/admin/PriceTable.jsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Space,
  message,
  Tag,
  Descriptions,
  DatePicker,
  Select,
  Spin,
  Empty,
  Input,
  Form,
  InputNumber,
  Tooltip,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  StopOutlined,
  PlayCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import apiClient from "../../utils/axiosConfig";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { confirm } = Modal;

export default function PriceTable() {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [activateModalOpen, setActivateModalOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [recordToDeactivate, setRecordToDeactivate] = useState(null);
  const [recordToActivate, setRecordToActivate] = useState(null);
  const [dealerLevels, setDealerLevels] = useState([]);
  const [vehicleModels, setVehicleModels] = useState([]);
  const [vehicleModelColors, setVehicleModelColors] = useState([]);
  const [editVehicleModelColors, setEditVehicleModelColors] = useState([]);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [filters, setFilters] = useState({
    dealerLevelId: undefined,
    startDate: undefined,
    endDate: undefined,
    search: undefined,
  });

  // 1. Load danh sách dealer levels
  const fetchDealerLevels = async () => {
    try {
      const res = await apiClient.get("/api/dealer-levels");
      if (res.data.success) {
        setDealerLevels(res.data.data || []);
      } else {
        message.error(
          res.data.message || "Không thể tải danh sách cấp đại lý!"
        );
      }
    } catch (err) {
      console.error("Error fetching dealer levels:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách cấp đại lý!";
      message.error(errorMsg);
    }
  };

  // 1.1. Load danh sách vehicle models
  const fetchVehicleModels = async () => {
    try {
      const res = await apiClient.get("/api/vehicle-models");
      // console.log("Vehicle models response:", res.data); // Debug log
      
      if (res.data.success) {
        setVehicleModels(res.data.data || []);
      } else {
        console.warn("API returned success=false:", res.data);
        message.error(res.data.message || "Không thể tải danh sách model xe!");
        setVehicleModels([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle models:", err);
      message.error(err.response?.data?.message || "Không thể tải danh sách model xe!");
      setVehicleModels([]);
    }
  };

  // 1.2. Load danh sách vehicle model colors theo model
  const fetchVehicleModelColors = async (vehicleModelId) => {
    if (!vehicleModelId) {
      setVehicleModelColors([]);
      return;
    }
    
    try {
      const res = await apiClient.get(`/api/vehicle-models/${vehicleModelId}/colors`);
      // console.log("Vehicle model colors response:", res.data); // Debug log
      
      if (res.data && Array.isArray(res.data)) {
        setVehicleModelColors(res.data);
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        setVehicleModelColors(res.data.data);
      } else if (res.data?.success && res.data?.data) {
        setVehicleModelColors(res.data.data);
      } else {
        console.warn("Unexpected vehicle model colors response:", res.data);
        setVehicleModelColors([]);
      }
    } catch (err) {
      console.error("Error fetching vehicle model colors:", err);
      message.error(err.response?.data?.message || "Không thể tải danh sách màu xe!");
      setVehicleModelColors([]);
    }
  };

  // 2. Load danh sách bảng giá (Admin xem tất cả)
  const fetchPrices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dealerLevelId) {
        params.append("dealerLevelId", filters.dealerLevelId);
      }
      if (filters.startDate) {
        params.append("startDate", filters.startDate.format("YYYY-MM-DD"));
      }
      if (filters.endDate) {
        params.append("endDate", filters.endDate.format("YYYY-MM-DD"));
      }

      const res = await apiClient.get(
        `/api/vehicle-prices?${params.toString()}`
      );
      if (res.data.success) {
        let priceData = res.data.data || [];
        
        // Filter by search term if provided
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          priceData = priceData.filter(
            (item) =>
              item.vehicleModelName?.toLowerCase().includes(searchTerm) ||
              item.colorName?.toLowerCase().includes(searchTerm) ||
              item.dealerLevelName?.toLowerCase().includes(searchTerm)
          );
        }
        
        setPrices(priceData);
        if (res.data.message) {
          message.success(res.data.message);
        }
      } else {
        message.error(res.data.message || "Không thể tải danh sách bảng giá!");
        setPrices([]);
      }
    } catch (err) {
      console.error("Error fetching prices:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách bảng giá!";
      message.error(errorMsg);
      setPrices([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. Lấy chi tiết bảng giá
  const fetchPriceDetail = async (id) => {
    try {
      const res = await apiClient.get(`/api/vehicle-prices/${id}`);
      if (res.data.success) {
        setSelectedPrice(res.data.data);
        setDetailModalOpen(true);
        // message.success(res.data.message);
      } else {
        message.error(res.data.message || "Không thể tải chi tiết bảng giá!");
      }
    } catch (err) {
      console.error("Error fetching price detail:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải chi tiết bảng giá!";
      message.error(errorMsg);
    }
  };

  // 4. Tạo mới bảng giá
  const handleCreatePrice = async (values) => {
    setCreateLoading(true);
    try {
      // Validate and format data
      const payload = {
        wholesalePrice: Number(values.wholesalePrice),
        effectiveFrom: values.effectiveFrom.format("YYYY-MM-DD"),
        effectiveTo: values.effectiveTo.format("YYYY-MM-DD"),
        vehicleModelColorId: Number(values.vehicleModelColorId),
        dealerLevelId: Number(values.dealerLevelId),
      };

      // console.log("Creating price with payload:", payload); // Debug log

      // Validate required fields
      if (!payload.wholesalePrice || payload.wholesalePrice <= 0) {
        message.error("Giá bán buôn phải lớn hơn 0!");
        return;
      }
      
      if (!payload.vehicleModelColorId) {
        message.error("Vui lòng chọn màu xe!");
        return;
      }
      
      if (!payload.dealerLevelId) {
        message.error("Vui lòng chọn cấp đại lý!");
        return;
      }

      // Check date validity
      if (values.effectiveFrom.isAfter(values.effectiveTo)) {
        message.error("Ngày hiệu lực phải trước ngày hết hạn!");
        return;
      }

      const res = await apiClient.post("/api/vehicle-prices", payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log("Create price response:", res.data); // Debug log
      
      if (res.data.success) {
        message.success("Tạo bảng giá mới thành công!");
        setCreateModalOpen(false);
        form.resetFields();
        setVehicleModelColors([]);
        fetchPrices(); // Reload danh sách
      } else {
        message.error(res.data.message || "Không thể tạo bảng giá mới!");
      }
    } catch (err) {
      console.error("Error creating price:", err);
      // console.error("Error response:", err.response?.data); // Debug log
      
      let errorMsg = "Không thể tạo bảng giá mới!";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!";
      }
      
      message.error(errorMsg);
    } finally {
      setCreateLoading(false);
    }
  };

  // 4.1. Vô hiệu hóa bảng giá
  const handleDeactivatePrice = async (priceId) => {
    // console.log("handleDeactivatePrice called with ID:", priceId); // Debug log
    try {
      const res = await apiClient.patch(`/api/vehicle-prices/${priceId}/deactivate`);
      // console.log("Deactivate price response:", res.data); // Debug log
      
      if (res.data.success) {
        message.success(res.data.message || "Vô hiệu hóa bảng giá thành công!");
        fetchPrices(); // Reload danh sách
      } else {
        message.error(res.data.message || "Không thể vô hiệu hóa bảng giá!");
      }
    } catch (err) {
      console.error("Error deactivating price:", err);
      // console.error("Error response data:", err.response?.data); // Debug log
      const errorMsg =
        err.response?.data?.message || "Không thể vô hiệu hóa bảng giá!";
      message.error(errorMsg);
    }
  };

  // 4.2. Confirm deactivate
  const confirmDeactivatePrice = (record) => {
    // console.log("confirmDeactivatePrice called with record:", record); // Debug log
    setRecordToDeactivate(record);
    setConfirmModalOpen(true);
  };

  // 4.3. Handle confirm deactivate
  const handleConfirmDeactivate = () => {
    // console.log("handleConfirmDeactivate called"); // Debug log
    if (recordToDeactivate) {
      // console.log("Calling handleDeactivatePrice with ID:", recordToDeactivate.id); // Debug log
      handleDeactivatePrice(recordToDeactivate.id);
      setConfirmModalOpen(false);
      setRecordToDeactivate(null);
    }
  };

  // 4.4. Kích hoạt lại bảng giá
  const handleActivatePrice = async (priceId) => {
    // console.log("handleActivatePrice called with ID:", priceId); // Debug log
    try {
      const res = await apiClient.patch(`/api/vehicle-prices/${priceId}/activate`);
      // console.log("Activate price response:", res.data); // Debug log
      
      if (res.data.success) {
        message.success(res.data.message || "Kích hoạt bảng giá thành công!");
        fetchPrices(); // Reload danh sách
      } else {
        message.error(res.data.message || "Không thể kích hoạt bảng giá!");
      }
    } catch (err) {
      console.error("Error activating price:", err);
      // console.error("Error response data:", err.response?.data); // Debug log
      const errorMsg =
        err.response?.data?.message || "Không thể kích hoạt bảng giá!";
      message.error(errorMsg);
    }
  };

  // 4.5. Confirm activate
  const confirmActivatePrice = (record) => {
    // console.log("confirmActivatePrice called with record:", record); // Debug log
    setRecordToActivate(record);
    setActivateModalOpen(true);
  };

  // 4.6. Handle confirm activate
  const handleConfirmActivate = () => {
    // console.log("handleConfirmActivate called"); // Debug log
    if (recordToActivate) {
      // console.log("Calling handleActivatePrice with ID:", recordToActivate.id); // Debug log
      handleActivatePrice(recordToActivate.id);
      setActivateModalOpen(false);
      setRecordToActivate(null);
    }
  };

  // 5. Mở modal tạo mới
  const openCreateModal = () => {
    form.resetFields();
    setVehicleModelColors([]);
    setCreateModalOpen(true);
  };

  // 6. Cập nhật bảng giá
  const handleUpdatePrice = async (values) => {
    setEditLoading(true);
    try {
      // Log original data vs new data for comparison
      // console.log("Original record:", editingPrice); // Debug log
      // console.log("Form values:", values); // Debug log
      
      // Validate and format data with fallback to original values
      const payload = {
        wholesalePrice: Number(values.wholesalePrice),
        effectiveFrom: values.effectiveFrom.format("YYYY-MM-DD"),
        effectiveTo: values.effectiveTo.format("YYYY-MM-DD"),
        vehicleModelColorId: Number(values.vehicleModelColorId) || editingPrice.originalVehicleModelColorId,
        dealerLevelId: Number(values.dealerLevelId) || editingPrice.originalDealerLevelId,
      };

      // console.log("Updating price with payload:", payload); // Debug log
      // console.log("Editing price ID:", editingPrice.id); // Debug log
      
      // Check what changed
      const changes = {
        priceChanged: payload.wholesalePrice !== editingPrice.wholesalePrice,
        dateFromChanged: payload.effectiveFrom !== editingPrice.effectiveFrom,
        dateToChanged: payload.effectiveTo !== editingPrice.effectiveTo,
        vehicleModelColorChanged: payload.vehicleModelColorId !== editingPrice.vehicleModelColorId,
        dealerLevelChanged: payload.dealerLevelId !== editingPrice.dealerLevelId,
      };
      // console.log("Changes detected:", changes); // Debug log

      // Validate required fields
      if (!payload.wholesalePrice || payload.wholesalePrice <= 0) {
        message.error("Giá bán buôn phải lớn hơn 0!");
        return;
      }
      
      if (!payload.vehicleModelColorId) {
        message.error("Vui lòng chọn màu xe!");
        return;
      }
      
      if (!payload.dealerLevelId) {
        message.error("Vui lòng chọn cấp đại lý!");
        return;
      }

      // Check date validity
      if (values.effectiveFrom.isAfter(values.effectiveTo)) {
        message.error("Ngày hiệu lực phải trước ngày hết hạn!");
        return;
      }

      // Validate IDs are numbers
      if (isNaN(payload.vehicleModelColorId) || isNaN(payload.dealerLevelId)) {
        message.error("Dữ liệu không hợp lệ. Vui lòng thử lại!");
        return;
      }

      // Additional validation for price
      if (typeof payload.wholesalePrice !== 'number' || payload.wholesalePrice < 0) {
        console.error("Invalid price:", payload.wholesalePrice, typeof payload.wholesalePrice);
        message.error("Giá không hợp lệ!");
        return;
      }

      // Try sending only changed fields to debug
      if (changes.priceChanged && !changes.dateFromChanged && !changes.dateToChanged) {
        // console.log("ONLY PRICE CHANGED - This might be causing the issue"); // Debug log
        
        // Try a different approach - send minimal payload for price-only updates
        const minimalPayload = {
          wholesalePrice: payload.wholesalePrice,
          effectiveFrom: editingPrice.effectiveFrom, // Keep original dates
          effectiveTo: editingPrice.effectiveTo,
          vehicleModelColorId: Number(editingPrice.vehicleModelColorId || payload.vehicleModelColorId),
          dealerLevelId: Number(editingPrice.dealerLevelId || payload.dealerLevelId),
        };
        // console.log("Trying minimal payload for price update:", minimalPayload); // Debug log
      }

      // console.log("Making API request to:", `/api/vehicle-prices/${editingPrice.id}`); // Debug log

      const res = await apiClient.put(`/api/vehicle-prices/${editingPrice.id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // console.log("Update price response:", res.data); // Debug log
      
      if (res.data.success) {
        message.success(res.data.message || "Cập nhật bảng giá thành công!");
        setEditModalOpen(false);
        editForm.resetFields();
        setEditVehicleModelColors([]);
        setEditingPrice(null);
        fetchPrices(); // Reload danh sách
      } else {
        console.error("API returned success=false:", res.data);
        message.error(res.data.message || "Không thể cập nhật bảng giá!");
      }
    } catch (err) {
      console.error("Error updating price:", err);
      // console.error("Error response:", err.response?.data); // Debug log
      // console.error("Error status:", err.response?.status); // Debug log
      // console.error("Error headers:", err.response?.headers); // Debug log
      
      let errorMsg = "Không thể cập nhật bảng giá!";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMsg = "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin!";
      } else if (err.response?.status === 500) {
        errorMsg = "Lỗi server. Vui lòng thử lại sau hoặc liên hệ admin!";
      } else if (err.response?.status === 404) {
        errorMsg = "Không tìm thấy bảng giá này. Có thể đã bị xóa!";
      }
      
      message.error(errorMsg);
    } finally {
      setEditLoading(false);
    }
  };

  // 7. Mở modal chỉnh sửa
  const openEditModal = (record) => {
    // console.log("Opening edit modal for record:", record); // Debug log
    // console.log("Available dealer levels:", dealerLevels); // Debug log
    // console.log("Available vehicle models:", vehicleModels); // Debug log
    
    setEditingPrice(record);
    
    // Find dealer level ID by name
    const dealerLevel = dealerLevels.find(dl => dl.levelName === record.dealerLevelName);
    // console.log("Found dealer level:", dealerLevel); // Debug log
    
    // Find vehicle model by name
    const vehicleModel = vehicleModels.find(vm => 
      vm.name === record.vehicleModelName || vm.modelName === record.vehicleModelName
    );
    // console.log("Found vehicle model:", vehicleModel); // Debug log
    
    // Store original IDs for fallback
    const originalData = {
      ...record,
      originalDealerLevelId: dealerLevel?.id,
      originalVehicleModelId: vehicleModel?.id,
    };
    setEditingPrice(originalData); // Store enhanced record with IDs
    
    // Pre-fill form with existing data
    const formData = {
      dealerLevelId: dealerLevel?.id,
      vehicleModelId: vehicleModel?.id,
      wholesalePrice: record.wholesalePrice,
      effectiveFrom: dayjs(record.effectiveFrom),
      effectiveTo: dayjs(record.effectiveTo),
    };
    
    // console.log("Setting form data:", formData); // Debug log
    editForm.setFieldsValue(formData);

    // Load colors if vehicle model found
    if (vehicleModel) {
      fetchEditVehicleModelColors(vehicleModel.id, record.colorName);
    } else {
      console.warn("Vehicle model not found for:", record.vehicleModelName);
      setEditVehicleModelColors([]);
    }

    setEditModalOpen(true);
  };

  // 8. Load màu xe cho edit modal
  const fetchEditVehicleModelColors = async (vehicleModelId, selectedColorName) => {
    // console.log("fetchEditVehicleModelColors called with:", vehicleModelId, selectedColorName); // Debug log
    
    if (!vehicleModelId) {
      setEditVehicleModelColors([]);
      return;
    }
    
    try {
      const res = await apiClient.get(`/api/vehicle-models/${vehicleModelId}/colors`);
      // console.log("Edit vehicle model colors response:", res.data); // Debug log
      
      let colors = [];
      if (res.data && Array.isArray(res.data)) {
        colors = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        colors = res.data.data;
      } else if (res.data?.success && res.data?.data) {
        colors = res.data.data;
      }
      
      // console.log("Processed colors:", colors); // Debug log
      setEditVehicleModelColors(colors);
      
      // Set selected color
      if (selectedColorName && colors.length > 0) {
        const selectedColor = colors.find(c => c.colorName === selectedColorName);
        // console.log("Found selected color:", selectedColor); // Debug log
        
        if (selectedColor) {
          editForm.setFieldsValue({ vehicleModelColorId: selectedColor.id });
          // console.log("Set vehicleModelColorId to:", selectedColor.id); // Debug log
          
          // Store original vehicleModelColorId for fallback
          if (editingPrice) {
            setEditingPrice(prev => ({
              ...prev,
              originalVehicleModelColorId: selectedColor.id
            }));
          }
        } else {
          console.warn("Color not found:", selectedColorName, "in colors:", colors.map(c => c.colorName));
        }
      }
    } catch (err) {
      console.error("Error fetching edit vehicle model colors:", err);
      setEditVehicleModelColors([]);
    }
  };

  useEffect(() => {
    fetchDealerLevels();
    fetchVehicleModels();
  }, []);

  // Debug log to check data
  // useEffect(() => {
  //   console.log("Vehicle models state:", vehicleModels);
  // }, [vehicleModels]);

  // useEffect(() => {
  //   console.log("Vehicle model colors state:", vehicleModelColors);
  // }, [vehicleModelColors]);

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dealerLevelId, filters.startDate, filters.endDate]);

  // 6. Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // 7. Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return dayjs(dateString).format("DD/MM/YYYY");
    } catch (error) {
      return "N/A";
    }
  };

  // 8. Xử lý filter
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      setFilters((prev) => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
      }));
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({
      ...prev,
      search: value,
    }));
    fetchPrices();
  };

  // 9. Reset filters
  const handleResetFilters = () => {
    setFilters({
      dealerLevelId: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    });
  };

  // 10. Cấu hình cột Table cho Admin (xem tất cả thông tin)
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Model xe",
      dataIndex: "vehicleModelName",
      key: "vehicleModelName",
      sorter: (a, b) =>
        (a.vehicleModelName || "").localeCompare(b.vehicleModelName || ""),
      render: (text) => (
        <span className="font-medium text-blue-600">{text || "N/A"}</span>
      ),
    },
    {
      title: "Màu xe",
      dataIndex: "colorName",
      key: "colorName",
      render: (color) => <Tag color="blue">{color || "N/A"}</Tag>,
    },
    {
      title: "Cấp đại lý",
      dataIndex: "dealerLevelName",
      key: "dealerLevelName",
      render: (level) => <Tag color="green">{level || "N/A"}</Tag>,
      filters: dealerLevels.map((level) => ({
        text: `Cấp ${level.levelNumber} - ${level.levelName}`,
        value: level.levelName,
      })),
      onFilter: (value, record) => record.dealerLevelName === value,
    },
    {
      title: "Giá bán buôn",
      dataIndex: "wholesalePrice",
      key: "wholesalePrice",
      render: (price) => (
        <span className="font-semibold text-green-600">
          {formatCurrency(price)}
        </span>
      ),
      sorter: (a, b) => (a.wholesalePrice || 0) - (b.wholesalePrice || 0),
      width: 150,
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effectiveFrom",
      key: "effectiveFrom",
      render: (date) => (
        <span className="text-gray-600">{formatDate(date)}</span>
      ),
      sorter: (a, b) => {
        if (!a.effectiveFrom && !b.effectiveFrom) return 0;
        if (!a.effectiveFrom) return 1;
        if (!b.effectiveFrom) return -1;
        return dayjs(a.effectiveFrom).unix() - dayjs(b.effectiveFrom).unix();
      },
      width: 120,
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "effectiveTo",
      key: "effectiveTo",
      render: (date) => (
        <span className="text-gray-600">{formatDate(date)}</span>
      ),
      width: 120,
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
      filters: [
        { text: "Hoạt động", value: true },
        { text: "Vô hiệu hóa", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      width: 120,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        // console.log("Rendering actions for record:", record, "isActive:", record.isActive); // Debug log
        return (
          <Space size="small">
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => fetchPriceDetail(record.id)}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => {
                  // console.log("Edit button clicked for record:", record); // Debug log
                  openEditModal(record);
                }}
                size="small"
              />
            </Tooltip>
            {record.isActive && (
              <Tooltip title="Vô hiệu hóa">
                <Button
                  type="link"
                  danger
                  icon={<StopOutlined />}
                  onClick={() => {
                    // console.log("Deactivate button clicked for record:", record); // Debug log
                    confirmDeactivatePrice(record);
                  }}
                  size="small"
                />
              </Tooltip>
            )}
            {!record.isActive && (
              <Tooltip title="Kích hoạt">
                <Button
                  type="link"
                  icon={<PlayCircleOutlined />}
                  onClick={() => {
                    // console.log("Activate button clicked for record:", record); // Debug log
                    confirmActivatePrice(record);
                  }}
                  size="small"
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Quản lý bảng giá xe (Admin)</h2>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPrices}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Thêm bảng giá mới
            </Button>
          </Space>
        </div>

        {/* Filters Section */}
        <Card className="mb-4" size="small">
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div className="flex flex-wrap gap-4">
              <div style={{ minWidth: "250px" }}>
                <label className="block mb-2 text-sm font-medium">
                  Tìm kiếm
                </label>
                <Search
                  placeholder="Tìm theo model, màu xe, cấp đại lý..."
                  value={filters.search}
                  onSearch={handleSearch}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  allowClear
                />
              </div>

              <div style={{ minWidth: "200px" }}>
                <label className="block mb-2 text-sm font-medium">
                  Cấp đại lý
                </label>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn cấp đại lý"
                  allowClear
                  value={filters.dealerLevelId}
                  onChange={(value) => handleFilterChange("dealerLevelId", value)}
                >
                  {dealerLevels.map((level) => (
                    <Option key={level.id} value={level.id}>
                      Cấp {level.levelNumber} - {level.levelName}
                    </Option>
                  ))}
                </Select>
              </div>

              <div style={{ minWidth: "300px" }}>
                <label className="block mb-2 text-sm font-medium">
                  Khoảng thời gian
                </label>
                <RangePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder={["Từ ngày", "Đến ngày"]}
                  value={
                    filters.startDate && filters.endDate
                      ? [filters.startDate, filters.endDate]
                      : null
                  }
                  onChange={handleDateRangeChange}
                />
              </div>

              <div className="flex items-end">
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={fetchPrices}
                    loading={loading}
                  >
                    Tìm kiếm
                  </Button>
                  <Button onClick={handleResetFilters}>Đặt lại</Button>
                </Space>
              </div>
            </div>
          </Space>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {prices.length}
              </div>
              <div className="text-gray-500">Tổng bảng giá</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {prices.filter((p) => p.isActive).length}
              </div>
              <div className="text-gray-500">Đang hoạt động</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {prices.filter((p) => !p.isActive).length}
              </div>
              <div className="text-gray-500">Vô hiệu hóa</div>
            </div>
          </Card>
          <Card size="small">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(prices.map((p) => p.vehicleModelName)).size}
              </div>
              <div className="text-gray-500">Model xe</div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Spin spinning={loading}>
          {prices.length === 0 && !loading ? (
            <Empty
              description="Không có dữ liệu bảng giá"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={prices}
              loading={loading}
              bordered
              scroll={{ x: 1500 }}
              pagination={{
                pageSize: 15,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} của ${total} bảng giá`,
              }}
              size="middle"
            />
          )}
        </Spin>
      </Card>

      {/* Modal chi tiết bảng giá */}
      <Modal
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedPrice(null);
        }}
        title="Chi tiết bảng giá"
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedPrice && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={1}>
              {selectedPrice.id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={selectedPrice.isActive ? "green" : "red"}>
                {selectedPrice.isActive ? "Hoạt động" : "Vô hiệu hóa"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Model xe" span={2}>
              <span className="font-medium text-blue-600">
                {selectedPrice.vehicleModelName || "N/A"}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Màu xe" span={1}>
              <Tag color="blue">{selectedPrice.colorName || "N/A"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Cấp đại lý" span={1}>
              <Tag color="green">{selectedPrice.dealerLevelName || "N/A"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán buôn" span={2}>
              <span className="font-semibold text-green-600 text-lg">
                {formatCurrency(selectedPrice.wholesalePrice)}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiệu lực" span={1}>
              {formatDate(selectedPrice.effectiveFrom)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn" span={1}>
              {formatDate(selectedPrice.effectiveTo) || "Không giới hạn"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal tạo mới bảng giá */}
      <Modal
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          form.resetFields();
          setVehicleModelColors([]);
        }}
        title="Tạo bảng giá mới"
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreatePrice}
          initialValues={{
            effectiveFrom: dayjs(),
            effectiveTo: dayjs().add(1, "month"),
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="dealerLevelId"
              label="Cấp đại lý"
              rules={[{ required: true, message: "Vui lòng chọn cấp đại lý!" }]}
            >
              <Select
                placeholder="Chọn cấp đại lý"
                showSearch
                optionFilterProp="children"
              >
                {dealerLevels.map((level) => (
                  <Select.Option key={level.id} value={level.id}>
                    Cấp {level.levelNumber} - {level.levelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="vehicleModelId"
              label="Model xe"
              rules={[{ required: true, message: "Vui lòng chọn model xe!" }]}
            >
              <Select
                placeholder="Chọn model xe"
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  form.setFieldsValue({ vehicleModelColorId: undefined });
                  fetchVehicleModelColors(value);
                }}
              >
                {vehicleModels.map((model) => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name || model.modelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="vehicleModelColorId"
            label="Màu xe"
            rules={[{ required: true, message: "Vui lòng chọn màu xe!" }]}
          >
            <Select
              placeholder="Chọn màu xe (chọn model trước)"
              showSearch
              optionFilterProp="children"
              disabled={vehicleModelColors.length === 0}
            >
              {vehicleModelColors.map((modelColor) => {
                // console.log("Model color object:", modelColor); // Debug log
                return (
                  <Select.Option key={modelColor.id} value={modelColor.id}>
                    <Space>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: modelColor.hexCode,
                          border: "1px solid #d9d9d9",
                          borderRadius: 2,
                          display: "inline-block",
                        }}
                      />
                      {modelColor.colorName} ({modelColor.hexCode})
                    </Space>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="wholesalePrice"
            label="Giá bán buôn (VND)"
            rules={[
              { required: true, message: "Vui lòng nhập giá bán buôn!" },
              { 
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                  }
                  return Promise.resolve();
                }
              },
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="Nhập giá bán buôn"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={1}
              step={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="effectiveFrom"
              label="Ngày hiệu lực"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hiệu lực!" },
                {
                  validator: (_, value) => {
                    if (value && form.getFieldValue('effectiveTo')) {
                      if (value.isAfter(form.getFieldValue('effectiveTo'))) {
                        return Promise.reject(new Error("Ngày hiệu lực phải trước ngày hết hạn!"));
                      }
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hiệu lực"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="effectiveTo"
              label="Ngày hết hạn"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
                {
                  validator: (_, value) => {
                    if (value && form.getFieldValue('effectiveFrom')) {
                      if (value.isBefore(form.getFieldValue('effectiveFrom'))) {
                        return Promise.reject(new Error("Ngày hết hạn phải sau ngày hiệu lực!"));
                      }
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hết hạn"
                disabledDate={(current) => {
                  const effectiveFrom = form.getFieldValue('effectiveFrom');
                  return current && effectiveFrom && current < effectiveFrom.startOf('day');
                }}
              />
            </Form.Item>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => {
                setCreateModalOpen(false);
                form.resetFields();
                setVehicleModelColors([]);
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createLoading}
              className="flex-1"
            >
              Tạo bảng giá
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa bảng giá */}
      <Modal
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          editForm.resetFields();
          setEditVehicleModelColors([]);
          setEditingPrice(null);
        }}
        title="Chỉnh sửa bảng giá"
        footer={null}
        width={800}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePrice}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="dealerLevelId"
              label="Cấp đại lý"
              rules={[{ required: true, message: "Vui lòng chọn cấp đại lý!" }]}
            >
              <Select
                placeholder="Chọn cấp đại lý"
                showSearch
                optionFilterProp="children"
              >
                {dealerLevels.map((level) => (
                  <Select.Option key={level.id} value={level.id}>
                    Cấp {level.levelNumber} - {level.levelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="vehicleModelId"
              label="Model xe"
              rules={[{ required: true, message: "Vui lòng chọn model xe!" }]}
            >
              <Select
                placeholder="Chọn model xe"
                showSearch
                optionFilterProp="children"
                onChange={(value) => {
                  editForm.setFieldsValue({ vehicleModelColorId: undefined });
                  fetchEditVehicleModelColors(value);
                }}
              >
                {vehicleModels.map((model) => (
                  <Select.Option key={model.id} value={model.id}>
                    {model.name || model.modelName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="vehicleModelColorId"
            label="Màu xe"
            rules={[{ required: true, message: "Vui lòng chọn màu xe!" }]}
          >
            <Select
              placeholder="Chọn màu xe (chọn model trước)"
              showSearch
              optionFilterProp="children"
              disabled={editVehicleModelColors.length === 0}
            >
              {editVehicleModelColors.map((modelColor) => {
                // console.log("Edit model color object:", modelColor); // Debug log
                return (
                  <Select.Option key={modelColor.id} value={modelColor.id}>
                    <Space>
                      <div
                        style={{
                          width: 20,
                          height: 20,
                          backgroundColor: modelColor.hexCode,
                          border: "1px solid #d9d9d9",
                          borderRadius: 2,
                          display: "inline-block",
                        }}
                      />
                      {modelColor.colorName} ({modelColor.hexCode})
                    </Space>
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          <Form.Item
            name="wholesalePrice"
            label="Giá bán buôn (VND)"
            rules={[
              { required: true, message: "Vui lòng nhập giá bán buôn!" },
              { 
                validator: (_, value) => {
                  if (!value || value <= 0) {
                    return Promise.reject(new Error("Giá phải lớn hơn 0!"));
                  }
                  return Promise.resolve();
                }
              },
            ]}
          >
            <InputNumber
              className="w-full"
              placeholder="Nhập giá bán buôn"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              min={1}
              step={1000}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="effectiveFrom"
              label="Ngày hiệu lực"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hiệu lực!" },
                {
                  validator: (_, value) => {
                    if (value && editForm.getFieldValue('effectiveTo')) {
                      if (value.isAfter(editForm.getFieldValue('effectiveTo'))) {
                        return Promise.reject(new Error("Ngày hiệu lực phải trước ngày hết hạn!"));
                      }
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hiệu lực"
              />
            </Form.Item>

            <Form.Item
              name="effectiveTo"
              label="Ngày hết hạn"
              rules={[
                { required: true, message: "Vui lòng chọn ngày hết hạn!" },
                {
                  validator: (_, value) => {
                    if (value && editForm.getFieldValue('effectiveFrom')) {
                      if (value.isBefore(editForm.getFieldValue('effectiveFrom'))) {
                        return Promise.reject(new Error("Ngày hết hạn phải sau ngày hiệu lực!"));
                      }
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày hết hạn"
                disabledDate={(current) => {
                  const effectiveFrom = editForm.getFieldValue('effectiveFrom');
                  return current && effectiveFrom && current < effectiveFrom.startOf('day');
                }}
              />
            </Form.Item>
          </div>

          <div className="flex gap-2 mt-6">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                editForm.resetFields();
                setEditVehicleModelColors([]);
                setEditingPrice(null);
              }}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={editLoading}
              className="flex-1"
            >
              Cập nhật bảng giá
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal xác nhận vô hiệu hóa */}
      <Modal
        open={confirmModalOpen}
        onCancel={() => {
          setConfirmModalOpen(false);
          setRecordToDeactivate(null);
        }}
        title="Xác nhận vô hiệu hóa bảng giá"
        okText="Vô hiệu hóa"
        cancelText="Hủy"
        okType="danger"
        onOk={handleConfirmDeactivate}
      >
        {recordToDeactivate && (
          <div>
            <p>Bạn có chắc chắn muốn vô hiệu hóa bảng giá này?</p>
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <div><strong>Model:</strong> {recordToDeactivate.vehicleModelName}</div>
              <div><strong>Màu:</strong> {recordToDeactivate.colorName}</div>
              <div><strong>Cấp đại lý:</strong> {recordToDeactivate.dealerLevelName}</div>
              <div><strong>Giá:</strong> {formatCurrency(recordToDeactivate.wholesalePrice)}</div>
            </div>
            <p className="mt-2 text-red-600">
              <strong>Lưu ý:</strong> Sau khi vô hiệu hóa, bảng giá này sẽ không còn áp dụng được.
            </p>
          </div>
        )}
      </Modal>

      {/* Modal xác nhận kích hoạt */}
      <Modal
        open={activateModalOpen}
        onCancel={() => {
          setActivateModalOpen(false);
          setRecordToActivate(null);
        }}
        title="Xác nhận kích hoạt bảng giá"
        okText="Kích hoạt"
        cancelText="Hủy"
        okType="primary"
        onOk={handleConfirmActivate}
      >
        {recordToActivate && (
          <div>
            <p>Bạn có chắc chắn muốn kích hoạt lại bảng giá này?</p>
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <div><strong>Model:</strong> {recordToActivate.vehicleModelName}</div>
              <div><strong>Màu:</strong> {recordToActivate.colorName}</div>
              <div><strong>Cấp đại lý:</strong> {recordToActivate.dealerLevelName}</div>
              <div><strong>Giá:</strong> {formatCurrency(recordToActivate.wholesalePrice)}</div>
            </div>
            <p className="mt-2 text-green-600">
              <strong>Lưu ý:</strong> Sau khi kích hoạt, bảng giá này sẽ có thể áp dụng được cho các dealer.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
