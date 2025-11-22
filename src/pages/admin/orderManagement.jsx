import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
  Card,
  Divider,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
  Progress,
  Typography,
  Popconfirm,
  InputNumber,
  Empty,
  Spin,
} from "antd";
import {
  EyeOutlined,
  SearchOutlined,
  FileTextOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  ShopOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import api from "../../config/axios";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState({}); // Loading state for approve actions
  const [confirmPaymentLoading, setConfirmPaymentLoading] = useState({}); // Loading state for payment confirmations
  const [confirmDepositLoading, setConfirmDepositLoading] = useState({}); // Loading state for deposit confirmations
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [depositNotes, setDepositNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState(0);
  const [attachVehicleModalVisible, setAttachVehicleModalVisible] =
    useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [attachVehicleLoading, setAttachVehicleLoading] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [manualPaymentModalVisible, setManualPaymentModalVisible] =
    useState(false);
  const [manualPaymentAmount, setManualPaymentAmount] = useState(0);
  const [manualPaymentNotes, setManualPaymentNotes] = useState("");
  const [manualPaymentLoading, setManualPaymentLoading] = useState({});

  // Installment confirmation states
  const [installmentModalVisible, setInstallmentModalVisible] = useState(false);
  const [confirmInstallmentLoading, setConfirmInstallmentLoading] = useState(
    {}
  );
  const [selectedInstallmentId, setSelectedInstallmentId] = useState(null);

  // Defects states
  const [defectsModalVisible, setDefectsModalVisible] = useState(false);
  const [defects, setDefects] = useState([]);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [rejectDefectLoading, setRejectDefectLoading] = useState({});
  const [approveDefectLoading, setApproveDefectLoading] = useState({});
  const [completeRepairLoading, setCompleteRepairLoading] = useState({});

  const [filters, setFilters] = useState({
    status: "",
    orderCode: "",
    dealerName: "",
    dateRange: null,
  });
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalAmount: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Helper function to format datetime
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/admin/orders");
      if (response.data && response.data.success) {
        const ordersData = response.data.data || [];
        setOrders(ordersData);
        calculateStatistics(ordersData);
      } else {
        message.error("Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      message.error("Error loading orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStatistics = (ordersData) => {
    const stats = {
      totalOrders: ordersData.length,
      totalAmount: ordersData.reduce(
        (sum, order) => sum + (order.totalAmount || 0),
        0
      ),
      pendingOrders: ordersData.filter((order) =>
        ["PENDING", "CONFIRMED", "SHIPPING"].includes(order.status)
      ).length,
      approvedOrders: ordersData.filter((order) => order.status === "APPROVED")
        .length,
      completedOrders: ordersData.filter((order) =>
        ["COMPLETED", "DELIVERED"].includes(order.status)
      ).length,
      rejectedOrders: ordersData.filter((order) =>
        ["REJECTED"].includes(order.status)
      ).length,
      cancelledOrders: ordersData.filter(
        (order) => order.status === "CANCELLED"
      ).length,
    };
    setStatistics(stats);
  };

  // Fetch available vehicles for attachment
  const fetchAvailableVehicles = async (orderId) => {
    setLoadingVehicles(true);
    try {
      // Use the correct API endpoint with proper query parameters
      // status=AVAILABLE and activeOnly=true to get only available and active vehicles
      const response = await api.get("/vehicle-instances", {
        params: {
          status: "AVAILABLE",
          activeOnly: true,
        },
      });

      if (response.data && response.data.success) {
        const vehicles = response.data.data || [];
        setAvailableVehicles(vehicles);

        if (vehicles.length === 0) {
          message.info("Hiện tại không có xe nào khả dụng để gắn vào đơn hàng");
        }
      } else {
        console.error("API returned success=false:", response.data);
        message.error(
          response.data?.message || "Không thể tải danh sách xe có sẵn"
        );
        setAvailableVehicles([]);
      }
    } catch (error) {
      console.error("Error fetching available vehicles:", error);

      let errorMessage = "Có lỗi xảy ra khi tải danh sách xe";
      if (error.response) {
        const status = error.response.status;
        if (status === 404) {
          errorMessage = "Không tìm thấy endpoint lấy danh sách xe";
        } else if (status === 403) {
          errorMessage = "Không có quyền truy cập danh sách xe";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }

      message.error(errorMessage);
      setAvailableVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Handle manual payment for straight payment orders
  const handleManualPayment = async (orderId, paidAmount, notes) => {
    setManualPaymentLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.post(
        `/admin/orders/${orderId}/manual-payment`,
        {
          paidAmount: paidAmount,
          notes: notes || "",
        }
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Cập nhật thanh toán thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Số tiền đã thanh toán: {formatCurrency(paidAmount)}</div>
              <div>Tiến độ thanh toán: {orderData.paymentProgress}%</div>
              {orderData.status === "COMPLETED" && (
                <div className="text-green-600">
                  ✓ Đơn hàng đã hoàn tất thanh toán
                </div>
              )}
            </div>
          ),
          duration: 6,
        });

        // Reset modal states
        setManualPaymentModalVisible(false);
        setManualPaymentAmount(0);
        setManualPaymentNotes("");

        // Refresh orders list
        fetchOrders();

        // Update selected order if modal is open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(orderData);
        }
      } else {
        console.error("API returned success=false:", response.data);
        message.error(
          response.data?.message || "Cập nhật thanh toán thất bại!"
        );
      }
    } catch (error) {
      console.error("Error manual payment:", error);

      let errorMessage = "Có lỗi xảy ra khi cập nhật thanh toán!";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage =
            data?.message ||
            "Yêu cầu không hợp lệ. Kiểm tra số tiền thanh toán.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy đơn hàng.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      }

      message.error(errorMessage);
    } finally {
      setManualPaymentLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle confirm installment payment
  const handleConfirmInstallmentPayment = async (orderId, installmentId) => {
    setConfirmInstallmentLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.post(
        `/admin/orders/${orderId}/installments/${installmentId}/confirm`
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Xác nhận kỳ thanh toán thành công!</strong>
              </div>
              <div>Mã đơn: {orderData.orderCode}</div>
              <div>Tiến độ thanh toán: {orderData.paymentProgress}%</div>
              {orderData.paymentProgress >= 100 && (
                <div>✅ Đã hoàn thành thanh toán</div>
              )}
            </div>
          ),
          duration: 5,
        });

        // Update selectedOrder with new data to reflect changes immediately
        setSelectedOrder(orderData);

        // Refresh orders list to get updated data
        await fetchOrders();
      } else {
        message.error(
          response.data?.message || "Xác nhận kỳ thanh toán thất bại!"
        );
      }
    } catch (error) {
      console.error("Error confirming installment:", error);

      let errorMessage = "Có lỗi xảy ra khi xác nhận kỳ thanh toán!";

      if (error.response?.data) {
        const { status, data } = error.response;

        if (status === 400) {
          errorMessage = data?.message || "Yêu cầu không hợp lệ.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy kỳ thanh toán.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      }

      message.error(errorMessage);
    } finally {
      setConfirmInstallmentLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle attach vehicle to order
  const handleAttachVehicle = async (orderId, vehicleId) => {
    setAttachVehicleLoading(true);
    try {
      const response = await api.patch(
        `/admin/orders/${orderId}/attach-vehicle/${vehicleId}`
      );

      if (response.data && response.data.success) {
        const vehicleData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Gắn xe vào đơn hàng thành công!</strong>
              </div>
              <div>VIN: {vehicleData.vin}</div>
              <div>Engine: {vehicleData.engineNumber}</div>
              <div>
                Model: {vehicleData.modelName} - {vehicleData.colorName}
              </div>
            </div>
          ),
          duration: 5,
        });

        // Reset modal states
        setAttachVehicleModalVisible(false);
        setSelectedVehicle(null);

        // Refresh orders list
        fetchOrders();

        // Update selected order if modal is open
        if (selectedOrder && selectedOrder.id === orderId) {
          // Refresh the selected order data
          const orderResponse = await api.get(`/admin/orders/${orderId}`);
          if (orderResponse.data && orderResponse.data.success) {
            setSelectedOrder(orderResponse.data.data);
          }
        }
      } else {
        message.error(
          response.data?.message || "Gắn xe vào đơn hàng thất bại!"
        );
      }
    } catch (error) {
      console.error("Error attaching vehicle:", error);

      let errorMessage = "Có lỗi xảy ra khi gắn xe vào đơn hàng!";

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage =
            data?.message ||
            "Yêu cầu không hợp lệ. Kiểm tra trạng thái đơn hàng và xe.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy đơn hàng hoặc xe.";
        } else {
          errorMessage = data?.message || errorMessage;
        }
      }

      message.error(errorMessage);
    } finally {
      setAttachVehicleLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      PENDING: "orange",
      CONFIRMED: "blue",
      APPROVED: "green",
      INSTALLMENT_ACTIVE: "purple",
      PROCESSING: "cyan",
      SHIPPING: "orange",
      SHIPPED: "purple",
      DELIVERED: "green",
      COMPLETED: "green",
      CANCELLED: "magenta",
      REJECTED: "red",
      REFUNDED: "volcano",
    };
    return statusColors[status] || "default";
  };

  // Map status code to Vietnamese label
  const getStatusLabel = (status) => {
    const map = {
      PENDING: "Chờ duyệt",
      CONFIRMED: "Đã xác nhận",
      APPROVED: "Đã phê duyệt",
      INSTALLMENT_ACTIVE: "Đang trả góp",
      PAID: "Đã xác nhận cọc",
      PROCESSING: "Đang xử lý",
      SHIPPING: "Đang vận chuyển",
      SHIPPED: "Đã gửi",
      DELIVERED: "Đã giao",
      COMPLETED: "Hoàn tất",
      CANCELLED: "Đã hủy",
      REJECTED: "Đã từ chối",
      REFUNDED: "Hoàn tiền",
      OVERDUE: "Quá hạn",
    };
    return map[status] || status;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount || 0);
  };

  // Handle order detail view
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  // Handle view defects
  const handleViewDefects = async (orderId) => {
    setLoadingDefects(true);
    setDefectsModalVisible(true);
    try {
      const res = await api.get(`/defects/admin/order/${orderId}`);
      if (res.data.success) {
        setDefects(res.data.data || []);
      } else {
        message.error(res.data.message || "Không thể tải danh sách xe lỗi!");
        setDefects([]);
      }
    } catch (err) {
      console.error("Error fetching defects:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể tải danh sách xe lỗi!";
      message.error(errorMsg);
      setDefects([]);
    } finally {
      setLoadingDefects(false);
    }
  };

  // Handle reject defect report
  const handleRejectDefectReport = async (orderId) => {
    setRejectDefectLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.patch(
        `defects/admin/orders/${orderId}/defect/reject`
      );
      if (res.data.success) {
        message.success(
          res.data.message || "Từ chối báo cáo xe lỗi thành công!",
          { duration: 4000 }
        );
        // Refresh defects list
        await handleViewDefects(orderId);
        // Refresh orders list
        fetchOrders();
      } else {
        message.error(res.data.message || "Không thể từ chối báo cáo xe lỗi!");
      }
    } catch (err) {
      console.error("Error rejecting defect report:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể từ chối báo cáo xe lỗi!";
      message.error(errorMsg);
    } finally {
      setRejectDefectLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle approve defect report
  const handleApproveDefectReport = async (orderId) => {
    setApproveDefectLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.patch(`/api/defects/admin/${orderId}/approve`);
      if (res.data.success) {
        message.success(
          res.data.message || "Phê duyệt báo cáo xe lỗi thành công!",
          { duration: 4000 }
        );
        // Refresh defects list
        if (orderId) {
          await handleViewDefects(orderId);
        }
        // Refresh orders list
        fetchOrders();
      } else {
        message.error(
          res.data.message || "Không thể phê duyệt báo cáo xe lỗi!"
        );
      }
    } catch (err) {
      console.error("Error approving defect report:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể phê duyệt báo cáo xe lỗi!";
      message.error(errorMsg);
    } finally {
      setApproveDefectLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle complete repair
  const handleCompleteRepair = async (orderId) => {
    setCompleteRepairLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await api.patch(
        `/api/defects/admin/${orderId}/complete-repair`
      );
      if (res.data.success) {
        message.success(
          res.data.message || "Xác nhận sửa xe lỗi hoàn tất thành công!",
          { duration: 4000 }
        );
        // Refresh defects list
        if (orderId) {
          await handleViewDefects(orderId);
        }
        // Refresh orders list
        fetchOrders();
      } else {
        message.error(
          res.data.message || "Không thể xác nhận sửa xe lỗi hoàn tất!"
        );
      }
    } catch (err) {
      console.error("Error completing repair:", err);
      const errorMsg =
        err.response?.data?.message ||
        "Không thể xác nhận sửa xe lỗi hoàn tất!";
      message.error(errorMsg);
    } finally {
      setCompleteRepairLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order approval
  const handleApproveOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      // Try with status in body as per API requirement
      const response = await api.patch(`/admin/orders/${orderId}/approve`, {
        status: "APPROVED",
      });

      if (response.data && response.data.success) {
        message.success({
          content: (
            <div>
              <div>
                <strong>Đơn hàng đã được phê duyệt thành công!</strong>
              </div>
              <div>Order Code: {response.data.data.orderCode}</div>
              <div>Status: {response.data.data.status}</div>
              <div>VIN/Engine đã được tạo và hàng đã nhập kho dealer</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list and close detail modal
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }
      } else {
        message.error(response.data?.message || "Phê duyệt đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error approving order:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi phê duyệt đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order rejection
  const handleRejectOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.patch(`/admin/orders/${orderId}/reject`);

      if (response.data && response.data.success) {
        const orderData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Đơn hàng đã bị từ chối!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {orderData.status}</div>
            </div>
          ),
          duration: 5,
        });

        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }
      } else {
        message.error(response.data?.message || "Từ chối đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error rejecting order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi từ chối đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.patch(`/admin/orders/${orderId}/cancel`);

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        message.success({
          content: (
            <div>
              <div>
                <strong>Đơn hàng đã được hủy thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {orderData.status}</div>
              <div>Lý do: Đơn hàng chưa hoàn tất hoặc chưa giao xe</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list and close detail modal
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setDetailModalVisible(false);
          setSelectedOrder(null);
        }
      } else {
        message.error(response.data?.message || "Hủy đơn hàng thất bại!");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi hủy đơn hàng!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle order shipping
  const handleShipOrder = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      // Enhanced API call with better error handling
      const response = await api.patch(
        `/admin/orders/${orderId}/shipping`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Đã bắt đầu vận chuyển đơn hàng!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {getStatusLabel(orderData.status)}</div>
              <div>Đơn hàng đã được chuyển sang trạng thái vận chuyển</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list
        fetchOrders();
      } else {
        console.error("API returned success=false:", response.data);
        message.error(response.data?.message || "Bắt đầu vận chuyển thất bại!");
      }
    } catch (error) {
      console.error("Error shipping order:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      // Enhanced error messaging
      let errorMessage = "Có lỗi xảy ra khi bắt đầu vận chuyển!";

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        if (status === 400) {
          errorMessage =
            data?.message ||
            "Yêu cầu không hợp lệ. Kiểm tra lại trạng thái đơn hàng.";
        } else if (status === 401) {
          errorMessage = "Không có quyền thực hiện thao tác này.";
        } else if (status === 403) {
          errorMessage = "Truy cập bị từ chối.";
        } else if (status === 404) {
          errorMessage = "Không tìm thấy đơn hàng.";
        } else if (status === 500) {
          errorMessage = "Lỗi server nội bộ.";
        } else {
          errorMessage =
            data?.message || `Lỗi HTTP ${status}: ${error.response.statusText}`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Không thể kết nối đến server. Kiểm tra kết nối mạng.";
      }

      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Handle activate installment
  const handleActivateInstallment = async (orderId) => {
    setApproveLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.patch(
        `/admin/orders/${orderId}/activate-installment`
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;
        message.success({
          content: (
            <div>
              <div>
                <strong>Đã kích hoạt trả góp thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {getStatusLabel(orderData.status)}</div>
              <div>Đơn hàng đã chuyển sang trạng thái trả góp</div>
            </div>
          ),
          duration: 5,
        });

        // Refresh orders list
        fetchOrders();
      } else {
        message.error(response.data?.message || "Kích hoạt trả góp thất bại!");
      }
    } catch (error) {
      console.error("Error activating installment:", error);
      const errorMessage =
        error.response?.data?.message || "Có lỗi xảy ra khi kích hoạt trả góp!";
      message.error(errorMessage);
    } finally {
      setApproveLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Check if order can be approved/rejected
  const canApproveOrder = (status) => {
    return status === "PENDING";
  };

  // Check if order can be cancelled
  const canCancelOrder = (status) => {
    // Can cancel orders that haven't been completed or delivered yet
    // Cannot cancel INSTALLMENT_ACTIVE orders as they have confirmed deposits
    return [
      "PENDING",
      "CONFIRMED",
      "APPROVED",
      "PROCESSING",
      "SHIPPED",
    ].includes(status);
  };

  // Check if order can be shipped
  const canShipOrder = (record) => {
    // Don't show shipping button for orders that are already shipping, delivered, completed, or cancelled
    if (
      ["SHIPPING", "DELIVERED", "COMPLETED", "CANCELLED"].includes(
        record.status
      )
    ) {
      return false;
    }

    // Must have attached vehicle first
    if (!record.assignedVehicle?.id) {
      return false;
    }

    // For installment orders: check if already shipped/delivered through additional fields
    if (record.isInstallment) {
      // Don't show if already shipped or delivered (check various possible fields)
      if (
        record.shippingStatus ||
        record.deliveryStatus ||
        record.isShipped ||
        record.isDelivered ||
        record.shippedDate ||
        record.deliveredDate
      ) {
        return false;
      }

      // FIX: Allow shipping for installment orders once deposit is paid (PAID status) and vehicle is attached.
      // The backend transitions from PAID -> SHIPPING.
      // The old check for "INSTALLMENT_ACTIVE" was incorrect as that status comes after delivery.
      return record.status === "PAID";
    } else {
      // For straight payment orders:
      // FIX: Kiểm tra chặt chẽ số tiền đã trả. Phải trả đủ 100% mới được ship.
      // Không dùng paymentProgress vì backend trả về 100% khi status là PAID.
      const paid = record.paidAmount || 0;
      const total = record.totalAmount || 0;
      // Cho phép sai số nhỏ (1000đ)
      const isFullyPaid = total > 0 && total - paid < 1000;

      return (
        isFullyPaid && ["CONFIRMED", "APPROVED", "PAID"].includes(record.status)
      );
    }
  };

  // Check if order can activate installment
  const canActivateInstallment = (status, isInstallment) => {
    return status === "DELIVERED" && isInstallment;
  };

  // Check if order can confirm deposit payment
  const canConfirmDeposit = (record) => {
    // Can confirm deposit for installment orders that are CONFIRMED and no deposit yet
    return (
      record.status === "CONFIRMED" &&
      record.isInstallment &&
      (record.paymentProgress || 0) === 0
    );
  };

  // Check if order can confirm installment payments
  const canConfirmInstallment = (record) => {
    return (
      record.isInstallment &&
      record.status === "SHIPPING" && // During shipping phase
      record.installmentSchedule &&
      record.installmentSchedule.length > 0
    );
  };

  // Check if order can do manual payment
  const canManualPayment = (record) => {
    // Backend cho phép thanh toán khi trạng thái là CONFIRMED hoặc PAID
    const validStatuses = ["CONFIRMED", "APPROVED", "PAID"];

    // FIX: Kiểm tra dựa trên số tiền thực tế thay vì paymentProgress từ API
    const paid = record.paidAmount || 0;
    const total = record.totalAmount || 0;

    // Nếu đã thanh toán đủ 100% (hoặc dư) thì không cho nhập thêm
    if (total > 0 && paid >= total) {
      return false;
    }

    // WORKAROUND: Nếu là đơn trả thẳng và trạng thái là PAID, có khả năng cao
    // backend đang trả về paidAmount = totalAmount dù chưa trả đủ.
    // Trong trường hợp này, ta vẫn cho phép thanh toán tiếp.
    if (!record.isInstallment && record.status === "PAID") {
      return true;
    }

    const isNotFullyPaid = paid < total;

    return (
      !record.isInstallment &&
      validStatuses.includes(record.status) &&
      isNotFullyPaid
    );
  };

  // Check if order can attach vehicle
  const canAttachVehicle = (record) => {
    const hasNoVehicle = !record.assignedVehicle || !record.assignedVehicle.id;

    // Don't allow attaching vehicle to completed/cancelled orders
    if (["COMPLETED", "DELIVERED", "CANCELLED"].includes(record.status)) {
      return false;
    }

    if (record.isInstallment) {
      // For installment: must confirm deposit first (INSTALLMENT_ACTIVE or PAID)
      return (
        (record.status === "INSTALLMENT_ACTIVE" || record.status === "PAID") &&
        hasNoVehicle
      );
    } else {
      // For straight payment: must be confirmed/paid and paid over 50%
      const allowedStatuses = ["CONFIRMED", "PAID", "APPROVED"];

      const paid = record.paidAmount || 0;
      const total = record.totalAmount || 0;
      const isOverFiftyPercent = total > 0 && paid / total >= 0.5;

      return (
        allowedStatuses.includes(record.status) &&
        hasNoVehicle &&
        isOverFiftyPercent
      );
    }
  };

  // Check if order can detach assigned vehicle (only when not delivered/completed)
  const canDetachVehicle = (record) => {
    if (!record?.assignedVehicle?.id) return false;
    // Không được gỡ khi đơn đã giao hoặc hoàn tất / hủy
    if (["DELIVERED", "COMPLETED", "CANCELLED"].includes(record.status)) {
      return false;
    }
    return true;
  };

  const handleDetachVehicle = async (orderId, vehicleId) => {
    if (!orderId || !vehicleId) return;
    try {
      const res = await api.patch(
        `/admin/orders/${orderId}/detach-vehicle/${vehicleId}`
      );
      const payload = res?.data;
      const success =
        payload?.success ?? (res.status >= 200 && res.status < 300);

      if (success) {
        const updatedOrder = payload?.data || payload;
        message.success(payload?.message || "Gỡ xe khỏi đơn hàng thành công");
        // Cập nhật danh sách và chi tiết đang mở
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId && updatedOrder) {
          setSelectedOrder(updatedOrder);
        }
      } else {
        message.error(
          payload?.message || "Gỡ xe khỏi đơn hàng thất bại, vui lòng thử lại"
        );
      }
    } catch (error) {
      console.error("Detach vehicle failed", error);
      message.error(
        error?.response?.data?.message ||
          "Không thể gỡ xe khỏi đơn hàng, vui lòng thử lại"
      );
    }
  };

  // Handle deposit confirmation
  const handleConfirmDeposit = async (orderId, amount, notes) => {
    setConfirmDepositLoading((prev) => ({ ...prev, [orderId]: true }));

    try {
      const response = await api.post(
        `/admin/orders/${orderId}/confirm-deposit`,
        {
          depositAmount: amount,
          notes: notes || "",
        }
      );

      if (response.data && response.data.success) {
        const orderData = response.data.data;

        message.success({
          content: (
            <div>
              <div>
                <strong>Xác nhận tiền cọc thành công!</strong>
              </div>
              <div>Order Code: {orderData.orderCode}</div>
              <div>Status: {getStatusLabel(orderData.status)}</div>
              <div>Tiến độ thanh toán: {orderData.paymentProgress}%</div>
              {orderData.status === "INSTALLMENT_ACTIVE" && (
                <div className="text-green-600">
                  ✓ Đã chuyển sang trạng thái trả góp
                </div>
              )}
            </div>
          ),
          duration: 6,
        });

        // Reset modal states
        setDepositModalVisible(false);
        setDepositNotes("");
        setDepositAmount(0);

        // Refresh orders list
        fetchOrders();

        // Update selected order if modal is open
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(orderData);
        }
      } else {
        console.error("API returned success=false:", response.data);
        message.error(response.data?.message || "Xác nhận tiền cọc thất bại!");
      }
    } catch (error) {
      console.error("Error confirming deposit:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Có lỗi xảy ra khi xác nhận tiền cọc!";
      message.error(errorMessage);
    } finally {
      setConfirmDepositLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // (removed unused helpers: hasInstallmentPayments, canConfirmInstallment)

  // Filter orders based on current filters
  const filteredOrders = orders.filter((order) => {
    let matches = true;

    if (filters.status && order.status !== filters.status) {
      matches = false;
    }

    if (
      filters.orderCode &&
      !order.orderCode.toLowerCase().includes(filters.orderCode.toLowerCase())
    ) {
      matches = false;
    }

    if (
      filters.dealerName &&
      !order.dealer?.name
        .toLowerCase()
        .includes(filters.dealerName.toLowerCase())
    ) {
      matches = false;
    }

    if (filters.dateRange && filters.dateRange.length === 2) {
      const orderDate = new Date(order.orderDate);
      const [startDate, endDate] = filters.dateRange;
      if (orderDate < startDate || orderDate > endDate) {
        matches = false;
      }
    }

    return matches;
  });

  // Table columns
  const columns = [
    {
      title: "Mã đơn hàng",
      dataIndex: "orderCode",
      key: "orderCode",
      width: 200,
      render: (text, record) => (
        <Button
          type="link"
          onClick={() => handleViewDetail(record)}
          className="p-0 h-auto"
        >
          {text}
        </Button>
      ),
    },
    {
      title: "Đại lý",
      dataIndex: "dealer",
      key: "dealer",
      width: 250,
      ellipsis: true,
      render: (dealer) => (
        <div>
          <div className="font-medium truncate" title={dealer?.name}>
            {dealer?.name}
          </div>
          <Text type="secondary" className="text-xs truncate">
            Mã: {dealer?.code} | Cấp: {dealer?.levelName}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusLabel(status)}</Tag>
      ),
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 180,
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Tiến độ thanh toán",
      dataIndex: "paymentProgress",
      key: "paymentProgress",
      width: 200,
      render: (progress, record) => {
        // FIX: Tự tính toán phần trăm để hiển thị chính xác
        const paid = record.paidAmount || 0;
        const total = record.totalAmount || 0;
        const actualProgress =
          total > 0 ? Math.min(100, Math.floor((paid / total) * 100)) : 0;

        return (
          <div className="min-w-0">
            <Progress
              percent={actualProgress}
              size="small"
              strokeColor={actualProgress === 100 ? "#52c41a" : "#1890ff"}
              className="mb-1"
            />
            <div
              className="text-xs text-gray-600 truncate"
              title={`Đã thanh toán: ${formatCurrency(paid)}`}
            >
              Đã TT: {formatCurrency(paid)}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.orderDate) - new Date(b.orderDate),
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 180,
      ellipsis: true,
      render: (createdBy) => (
        <div>
          <div className="font-medium truncate" title={createdBy?.fullName}>
            {createdBy?.fullName}
          </div>
          <Text type="secondary" className="text-xs truncate">
            @{createdBy?.username}
          </Text>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 320,
      fixed: "right",
      render: (_, record) => (
        <Space direction="vertical" size="small" className="w-full">
          <Space>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
                size="small"
              >
                Xem
              </Button>
            </Tooltip>
          </Space>

          {canApproveOrder(record.status) && (
            <Space wrap>
              <Popconfirm
                title="Phê duyệt đơn hàng"
                description={
                  <div>
                    <div>Bạn có chắc chắn muốn phê duyệt đơn hàng này?</div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Tự động tạo VIN/Engine
                      <br />• Nhập hàng vào kho dealer
                    </div>
                  </div>
                }
                onConfirm={() => handleApproveOrder(record.id)}
                okText="Phê duyệt"
                cancelText="Hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  type: "primary",
                }}
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Phê duyệt
                </Button>
              </Popconfirm>
            </Space>
          )}

          {canShipOrder(record) && (
            <Space>
              <Popconfirm
                title="Bắt đầu vận chuyển"
                description={
                  <div>
                    <div>
                      Bạn có chắc chắn muốn bắt đầu vận chuyển đơn hàng này?
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Chuyển sang trạng thái "Đang vận chuyển"
                      <br />• Dealer sẽ được thông báo về việc giao hàng
                      {record.isInstallment && (
                        <>
                          <br />• Đơn trả góp đã xác nhận tiền cọc
                        </>
                      )}
                    </div>
                  </div>
                }
                onConfirm={() => handleShipOrder(record.id)}
                okText="Bắt đầu vận chuyển"
                cancelText="Hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  type: "primary",
                }}
              >
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Bắt đầu vận chuyển
                </Button>
              </Popconfirm>
            </Space>
          )}

          {canCancelOrder(record.status) && (
            <Space>
              <Popconfirm
                title="Hủy đơn hàng"
                description={
                  <div>
                    <div>Bạn có chắc chắn muốn hủy đơn hàng này?</div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Đơn hàng chưa hoàn tất hoặc chưa giao xe
                      <br />• Hành động này không thể hoàn tác
                    </div>
                  </div>
                }
                onConfirm={() => handleCancelOrder(record.id)}
                okText="Hủy đơn hàng"
                cancelText="Không hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  danger: true,
                }}
              >
                <Button
                  type="default"
                  icon={<StopOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Hủy đơn hàng
                </Button>
              </Popconfirm>
            </Space>
          )}

          {canAttachVehicle(record) && (
            <Space>
              <Button
                type="primary"
                icon={<CarOutlined />}
                size="small"
                loading={attachVehicleLoading}
                onClick={() => {
                  setSelectedOrder(record);
                  fetchAvailableVehicles(record.id);
                  setAttachVehicleModalVisible(true);
                }}
              >
                Gắn xe
              </Button>
            </Space>
          )}

          {canConfirmDeposit(record) && (
            <Space>
              <Button
                type="primary"
                icon={<DollarOutlined />}
                size="small"
                loading={confirmDepositLoading[record.id]}
                disabled={Object.values(confirmDepositLoading).some(
                  (loading) => loading
                )}
                onClick={() => {
                  setSelectedOrder(record);
                  setDepositAmount(record.depositAmount || 0);
                  setDepositModalVisible(true);
                }}
              >
                Xác nhận tiền cọc
              </Button>
            </Space>
          )}

          {canManualPayment(record) && (
            <Space>
              <Button
                type="primary"
                icon={<DollarCircleOutlined />}
                size="small"
                loading={manualPaymentLoading[record.id]}
                disabled={Object.values(manualPaymentLoading).some(
                  (loading) => loading
                )}
                onClick={() => {
                  setSelectedOrder(record);
                  setManualPaymentAmount(0);
                  setManualPaymentModalVisible(true);
                }}
              >
                Nhập thanh toán
              </Button>
            </Space>
          )}

          {canActivateInstallment(record.status, record.isInstallment) && (
            <Space>
              <Popconfirm
                title="Kích hoạt trả góp"
                description={
                  <div>
                    <div>
                      Bạn có chắc chắn muốn kích hoạt trả góp cho đơn hàng này?
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      • Chuyển từ "Đã giao" sang "Đang trả góp"
                      <br />• Cho phép xác nhận thanh toán các kỳ trả góp
                    </div>
                  </div>
                }
                onConfirm={() => handleActivateInstallment(record.id)}
                okText="Kích hoạt"
                cancelText="Hủy"
                okButtonProps={{
                  loading: approveLoading[record.id],
                  type: "primary",
                }}
              >
                <Button
                  type="primary"
                  icon={<DollarCircleOutlined />}
                  size="small"
                  loading={approveLoading[record.id]}
                  disabled={Object.values(approveLoading).some(
                    (loading) => loading
                  )}
                >
                  Kích hoạt trả góp
                </Button>
              </Popconfirm>
            </Space>
          )}

          {/* Confirm Installment Payment Button */}
          {canConfirmInstallment(record) && (
            <Space>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                size="small"
                loading={confirmInstallmentLoading[record.id]}
                disabled={Object.values(confirmInstallmentLoading).some(
                  (loading) => loading
                )}
                onClick={() => {
                  setSelectedOrder(record);
                  setInstallmentModalVisible(true);
                }}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Xác nhận kỳ thanh toán
              </Button>
            </Space>
          )}

          {!canApproveOrder(record.status) &&
            !canCancelOrder(record.status) &&
            !canShipOrder(record) &&
            !canAttachVehicle(record) &&
            !canConfirmDeposit(record) &&
            !canManualPayment(record) &&
            !canActivateInstallment(record.status, record.isInstallment) && (
              <Tag color="default" className="text-xs">
                {record.status === "APPROVED"
                  ? "Đã phê duyệt"
                  : record.status === "INSTALLMENT_ACTIVE"
                  ? "Đang trả góp"
                  : record.status === "PAID"
                  ? "Chờ bắt đầu vận chuyển"
                  : record.status === "SHIPPING"
                  ? "Đang vận chuyển"
                  : record.status === "DELIVERED"
                  ? "Đã giao xe"
                  : record.status === "REJECTED"
                  ? "Đã từ chối"
                  : record.status === "CANCELLED"
                  ? "Đã hủy"
                  : record.status === "COMPLETED"
                  ? "Đã hoàn tất"
                  : "Không thể thao tác"}
              </Tag>
            )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          <FileTextOutlined className="mr-2" />
          Quản lý đơn hàng
        </Title>
      </div>

      {/* Statistics */}
      <Row gutter={16} className="mb-6" align="stretch">
        <Col span={4} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Tổng số đơn"
              value={statistics.totalOrders}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col span={4} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Tổng doanh số"
              value={statistics.totalAmount}
              formatter={(value) => formatCurrency(value)}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={3} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Chờ duyệt"
              value={statistics.pendingOrders}
              valueStyle={{ color: "#fa8c16" }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Đã phê duyệt"
              value={statistics.approvedOrders}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={3} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Hoàn tất"
              value={statistics.completedOrders}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={2} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Từ chối"
              value={statistics.rejectedOrders}
              valueStyle={{ color: "#f5222d" }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={2} style={{ display: "flex" }}>
          <Card style={{ width: "100%" }} styles={{ body: { padding: 16 } }}>
            <Statistic
              title="Đã hủy"
              value={statistics.cancelledOrders}
              valueStyle={{ color: "#722ed1" }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col span={3} style={{ display: "flex" }}>
          <Card
            className="bg-gradient-to-r from-blue-50 to-green-50"
            style={{ width: "100%" }}
            styles={{ body: { padding: 16 } }}
          >
            <Statistic
              title="Tỉ lệ thành công"
              value={
                statistics.totalOrders > 0
                  ? Math.round(
                      ((statistics.approvedOrders +
                        statistics.completedOrders) /
                        statistics.totalOrders) *
                        100
                    )
                  : 0
              }
              suffix="%"
              valueStyle={{ color: "#13c2c2" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col span={6}>
            <Search
              placeholder="Tìm theo mã đơn hàng"
              value={filters.orderCode}
              onChange={(e) =>
                setFilters({ ...filters, orderCode: e.target.value })
              }
              allowClear
              size="middle"
            />
          </Col>
          <Col span={6}>
            <Search
              placeholder="Tìm theo tên đại lý"
              value={filters.dealerName}
              onChange={(e) =>
                setFilters({ ...filters, dealerName: e.target.value })
              }
              allowClear
              size="middle"
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
              className="w-full"
              size="middle"
            >
              <Option value="PENDING">Chờ duyệt</Option>
              <Option value="CONFIRMED">Đã xác nhận</Option>
              <Option value="APPROVED">Đã phê duyệt</Option>
              <Option value="INSTALLMENT_ACTIVE">Đang trả góp</Option>
              <Option value="PROCESSING">Đang xử lý</Option>
              <Option value="SHIPPING">Đang vận chuyển</Option>
              <Option value="SHIPPED">Đã gửi</Option>
              <Option value="DELIVERED">Đã giao</Option>
              <Option value="COMPLETED">Hoàn tất</Option>
              <Option value="REJECTED">Đã từ chối</Option>
              <Option value="CANCELLED">Đã hủy</Option>
            </Select>
          </Col>
          <Col span={6}>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
              className="w-full"
              format="DD/MM/YYYY"
              size="middle"
            />
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            rowKey="id"
            loading={loading}
            scroll={{ x: 1800 }}
            size="middle"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} đơn hàng`,
            }}
          />
        </div>
      </Card>

      {/* Order Detail Modal */}
      <Modal
        title={
          <span>
            <EyeOutlined className="mr-2" />
            Chi tiết đơn hàng
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={1000}
        footer={
          selectedOrder ? (
            <Space>
              <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>

              <Button
                icon={<FileTextOutlined />}
                onClick={() => handleViewDefects(selectedOrder.id)}
              >
                Xem xe lỗi
              </Button>

              {canApproveOrder(selectedOrder.status) && (
                <Space>
                  <Popconfirm
                    title="Phê duyệt đơn hàng"
                    description={
                      <div>
                        <div>Bạn có chắc chắn muốn phê duyệt đơn hàng này?</div>
                        <div className="mt-2 text-sm text-gray-600">
                          • Tự động tạo VIN/Engine
                          <br />• Nhập hàng vào kho dealer
                        </div>
                      </div>
                    }
                    onConfirm={() => handleApproveOrder(selectedOrder.id)}
                    okText="Phê duyệt"
                    cancelText="Hủy"
                    okButtonProps={{
                      loading: approveLoading[selectedOrder.id],
                      type: "primary",
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<CheckCircleOutlined />}
                      loading={approveLoading[selectedOrder.id]}
                      disabled={Object.values(approveLoading).some(
                        (loading) => loading
                      )}
                    >
                      Phê duyệt
                    </Button>
                  </Popconfirm>

                  <Popconfirm
                    title="Từ chối đơn hàng"
                    description="Bạn có chắc chắn muốn từ chối đơn hàng này?"
                    onConfirm={() => handleRejectOrder(selectedOrder.id)}
                    okText="Từ chối"
                    cancelText="Hủy"
                    okButtonProps={{
                      loading: approveLoading[selectedOrder.id],
                      danger: true,
                    }}
                  >
                    <Button
                      danger
                      icon={<CloseCircleOutlined />}
                      loading={approveLoading[selectedOrder.id]}
                      disabled={Object.values(approveLoading).some(
                        (loading) => loading
                      )}
                    >
                      Từ chối
                    </Button>
                  </Popconfirm>
                </Space>
              )}

              {canShipOrder(selectedOrder) && (
                <Popconfirm
                  title="Bắt đầu vận chuyển"
                  description={
                    <div>
                      <div>
                        Bạn có chắc chắn muốn bắt đầu vận chuyển đơn hàng này?
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        • Chuyển sang trạng thái "Đang vận chuyển"
                        <br />• Dealer sẽ được thông báo về việc giao hàng
                        {selectedOrder.isInstallment && (
                          <>
                            <br />• Đơn trả góp đã xác nhận tiền cọc
                          </>
                        )}
                      </div>
                    </div>
                  }
                  onConfirm={() => handleShipOrder(selectedOrder.id)}
                  okText="Bắt đầu vận chuyển"
                  cancelText="Hủy"
                  okButtonProps={{
                    loading: approveLoading[selectedOrder.id],
                    type: "primary",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<CarOutlined />}
                    loading={approveLoading[selectedOrder.id]}
                    disabled={Object.values(approveLoading).some(
                      (loading) => loading
                    )}
                  >
                    Bắt đầu vận chuyển
                  </Button>
                </Popconfirm>
              )}

              {canAttachVehicle(selectedOrder) && (
                <Button
                  type="primary"
                  icon={<CarOutlined />}
                  loading={attachVehicleLoading}
                  onClick={() => {
                    fetchAvailableVehicles(selectedOrder.id);
                    setAttachVehicleModalVisible(true);
                  }}
                >
                  Gắn xe
                </Button>
              )}

              {canConfirmDeposit(selectedOrder) && (
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  loading={confirmDepositLoading[selectedOrder.id]}
                  disabled={Object.values(confirmDepositLoading).some(
                    (loading) => loading
                  )}
                  onClick={() => {
                    setDepositAmount(selectedOrder.depositAmount || 0);
                    setDepositModalVisible(true);
                  }}
                >
                  Xác nhận tiền cọc
                </Button>
              )}

              {canManualPayment(selectedOrder) && (
                <Button
                  type="primary"
                  icon={<DollarCircleOutlined />}
                  loading={manualPaymentLoading[selectedOrder.id]}
                  disabled={Object.values(manualPaymentLoading).some(
                    (loading) => loading
                  )}
                  onClick={() => {
                    setManualPaymentAmount(0);
                    setManualPaymentModalVisible(true);
                  }}
                >
                  Nhập thanh toán
                </Button>
              )}

              {canActivateInstallment(
                selectedOrder.status,
                selectedOrder.isInstallment
              ) && (
                <Popconfirm
                  title="Kích hoạt trả góp"
                  description={
                    <div>
                      <div>
                        Bạn có chắc chắn muốn kích hoạt trả góp cho đơn hàng
                        này?
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        • Chuyển từ "Đã giao" sang "Đang trả góp"
                        <br />• Cho phép xác nhận thanh toán các kỳ trả góp
                      </div>
                    </div>
                  }
                  onConfirm={() => handleActivateInstallment(selectedOrder.id)}
                  okText="Kích hoạt"
                  cancelText="Hủy"
                  okButtonProps={{
                    loading: approveLoading[selectedOrder.id],
                    type: "primary",
                  }}
                >
                  <Button
                    type="primary"
                    icon={<DollarCircleOutlined />}
                    loading={approveLoading[selectedOrder.id]}
                    disabled={Object.values(approveLoading).some(
                      (loading) => loading
                    )}
                  >
                    Kích hoạt trả góp
                  </Button>
                </Popconfirm>
              )}

              {canCancelOrder(selectedOrder.status) && (
                <Popconfirm
                  title="Hủy đơn hàng"
                  description={
                    <div>
                      <div>Bạn có chắc chắn muốn hủy đơn hàng này?</div>
                      <div className="mt-2 text-sm text-gray-600">
                        • Đơn hàng chưa hoàn tất hoặc chưa giao xe
                        <br />• Hành động này không thể hoàn tác
                      </div>
                    </div>
                  }
                  onConfirm={() => handleCancelOrder(selectedOrder.id)}
                  okText="Hủy đơn hàng"
                  cancelText="Không hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="default"
                    icon={<StopOutlined />}
                    loading={approveLoading[selectedOrder.id]}
                    disabled={Object.values(approveLoading).some(
                      (loading) => loading
                    )}
                  >
                    Hủy đơn hàng
                  </Button>
                </Popconfirm>
              )}
            </Space>
          ) : (
            <Button onClick={() => setDetailModalVisible(false)}>Đóng</Button>
          )
        }
      >
        {selectedOrder && (
          <div>
            {/* Basic Order Info */}
            <Card className="mb-4">
              <Descriptions title="Thông tin đơn hàng" bordered>
                <Descriptions.Item label="Mã đơn hàng" span={2}>
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo đơn">
                  {formatDateTime(selectedOrder.orderDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong className="text-lg">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ thanh toán">
                  {/* FIX: Tự tính toán phần trăm trong modal chi tiết */}
                  <Progress
                    percent={
                      selectedOrder.totalAmount > 0
                        ? Math.min(
                            100,
                            Math.floor(
                              ((selectedOrder.paidAmount || 0) /
                                selectedOrder.totalAmount) *
                                100
                            )
                          )
                        : 0
                    }
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Tiền đặt cọc">
                  {formatCurrency(selectedOrder.depositAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Đã thanh toán">
                  {formatCurrency(selectedOrder.paidAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Còn lại">
                  <Text
                    type={
                      selectedOrder.totalAmount -
                        (selectedOrder.paidAmount || 0) >
                      0
                        ? "warning"
                        : "success"
                    }
                  >
                    {formatCurrency(
                      selectedOrder.totalAmount -
                        (selectedOrder.paidAmount || 0)
                    )}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Hình thức thanh toán">
                  <Tag color={selectedOrder.isInstallment ? "blue" : "green"}>
                    {selectedOrder.isInstallment
                      ? "Trả góp"
                      : "Thanh toán 1 lần"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày thanh toán đủ">
                  {formatDate(selectedOrder.fullPaymentDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú" span={3}>
                  {selectedOrder.notes || "Không có ghi chú"}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Dealer Information */}
            <Card
              title={
                <span>
                  <ShopOutlined className="mr-2" />
                  Thông tin đại lý
                </span>
              }
              className="mb-4"
            >
              <Descriptions bordered>
                <Descriptions.Item label="Tên đại lý" span={2}>
                  {selectedOrder.dealer?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mã đại lý">
                  {selectedOrder.dealer?.code}
                </Descriptions.Item>
                <Descriptions.Item label="Cấp độ">
                  <Tag color="blue">{selectedOrder.dealer?.levelName}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Công nợ hiện tại">
                  <Text
                    type={
                      selectedOrder.dealer?.currentDebt > 0
                        ? "danger"
                        : "success"
                    }
                  >
                    {formatCurrency(selectedOrder.dealer?.currentDebt)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Hạn mức còn lại">
                  {formatCurrency(selectedOrder.dealer?.availableCredit)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Created By */}
            <Card
              title={
                <span>
                  <UserOutlined className="mr-2" />
                  Người tạo
                </span>
              }
              className="mb-4"
            >
              <Descriptions bordered>
                <Descriptions.Item label="Họ và tên">
                  {selectedOrder.createdBy?.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Tài khoản">
                  {selectedOrder.createdBy?.username}
                </Descriptions.Item>
                <Descriptions.Item label="Tạo lúc">
                  {formatDateTime(selectedOrder.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Cập nhật lúc">
                  {formatDateTime(selectedOrder.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Order Details */}
            <Card
              title={
                <span>
                  <CarOutlined className="mr-2" />
                  Sản phẩm
                </span>
              }
              className="mb-4"
            >
              {selectedOrder.orderDetails &&
              selectedOrder.orderDetails.length > 0 ? (
                <Table
                  dataSource={selectedOrder.orderDetails}
                  rowKey={(record, index) => record.id || index}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "Model xe",
                      dataIndex: "vehicleModelName",
                      key: "vehicleModelName",
                    },
                    {
                      title: "Màu",
                      dataIndex: "vehicleColorName",
                      key: "vehicleColorName",
                      render: (color) => <Tag>{color}</Tag>,
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                      align: "center",
                    },
                    {
                      title: "Đơn giá",
                      dataIndex: "unitPrice",
                      key: "unitPrice",
                      render: (price) => formatCurrency(price),
                    },
                    {
                      title: "Thành tiền",
                      dataIndex: "totalPrice",
                      key: "totalPrice",
                      render: (price) => (
                        <Text strong>{formatCurrency(price)}</Text>
                      ),
                    },
                  ]}
                />
              ) : selectedOrder.requestedModelColor ? (
                <Descriptions bordered size="small">
                  <Descriptions.Item label="Model xe yêu cầu" span={2}>
                    {selectedOrder.requestedModelColor.modelName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Màu">
                    <Tag>{selectedOrder.requestedModelColor.colorName}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền" span={3}>
                    <Text strong className="text-lg">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">
                    Chưa có thông tin sản phẩm chi tiết
                  </Text>
                </div>
              )}
            </Card>

            {/* Assigned Vehicle */}
            <Card
              title={
                <span>
                  <CarOutlined className="mr-2" />
                  Xe được gắn
                </span>
              }
              className="mb-4"
            >
              {selectedOrder.assignedVehicle ? (
                <>
                  <Descriptions bordered>
                    <Descriptions.Item label="VIN" span={2}>
                      <Text strong>{selectedOrder.assignedVehicle.vin}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Engine Number">
                      <Text strong>
                        {selectedOrder.assignedVehicle.engineNumber}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Model">
                      {selectedOrder.assignedVehicle.modelName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Màu">
                      <Tag>{selectedOrder.assignedVehicle.colorName}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <Tag
                        color={getStatusColor(
                          selectedOrder.assignedVehicle.status
                        )}
                      >
                        {selectedOrder.assignedVehicle.status}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                  {canDetachVehicle(selectedOrder) && (
                    <div className="mt-3 text-right">
                      <Popconfirm
                        title="Gỡ xe khỏi đơn hàng"
                        description="Bạn có chắc chắn muốn gỡ xe này khỏi đơn hàng?"
                        okText="Gỡ xe"
                        cancelText="Hủy"
                        onConfirm={() =>
                          handleDetachVehicle(
                            selectedOrder.id,
                            selectedOrder.assignedVehicle.id
                          )
                        }
                      >
                        <Button danger type="default" icon={<CarOutlined />}>
                          Gỡ xe khỏi đơn
                        </Button>
                      </Popconfirm>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">
                    Chưa có xe nào được gắn vào đơn hàng này
                  </Text>
                  {canAttachVehicle(selectedOrder) ? (
                    <div className="mt-3">
                      <Button
                        type="primary"
                        icon={<CarOutlined />}
                        loading={attachVehicleLoading}
                        onClick={() => {
                          fetchAvailableVehicles(selectedOrder.id);
                          setAttachVehicleModalVisible(true);
                        }}
                      >
                        Gắn xe ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <Text type="secondary" className="text-xs">
                        Không thể gắn xe ở trạng thái hiện tại (
                        {getStatusLabel(selectedOrder.status)})
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Installment Plans */}
            {selectedOrder.isInstallment &&
              selectedOrder.installmentPlans?.length > 0 && (
                <Card
                  title={
                    <span>
                      <CalendarOutlined className="mr-2" />
                      Kế hoạch trả góp
                    </span>
                  }
                >
                  <Table
                    dataSource={selectedOrder.installmentPlans}
                    rowKey="installmentNumber"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: "Kỳ #",
                        dataIndex: "installmentNumber",
                        key: "installmentNumber",
                        align: "center",
                      },
                      {
                        title: "Số tiền",
                        dataIndex: "installmentAmount",
                        key: "installmentAmount",
                        render: (amount) => formatCurrency(amount),
                      },
                      {
                        title: "Ngày đến hạn",
                        dataIndex: "dueDate",
                        key: "dueDate",
                        render: (date) => formatDate(date),
                      },
                      {
                        title: "Trạng thái",
                        dataIndex: "status",
                        key: "status",
                        render: (status, record) => (
                          <Space>
                            <Tag color={getStatusColor(status)}>
                              {getStatusLabel(status)}
                            </Tag>
                            {record.isOverdue && <Tag color="red">Quá hạn</Tag>}
                          </Space>
                        ),
                      },
                      {
                        title: "Xác nhận thanh toán",
                        key: "paymentConfirmation",
                        align: "center",
                        render: (_, record) => {
                          const canConfirmPayment =
                            (selectedOrder.status === "CONFIRMED" ||
                              selectedOrder.status === "INSTALLMENT_ACTIVE" ||
                              selectedOrder.status === "DELIVERED") &&
                            (record.status === "PENDING" ||
                              record.status === "OVERDUE");

                          if (record.status === "PAID") {
                            return <Tag color="green">Đã thanh toán</Tag>;
                          }

                          if (canConfirmPayment) {
                            return (
                              <Button
                                type="primary"
                                size="small"
                                icon={<DollarCircleOutlined />}
                                loading={
                                  confirmPaymentLoading[
                                    `${selectedOrder.id}-${record.installmentNumber}`
                                  ]
                                }
                                onClick={() =>
                                  handleConfirmInstallmentPayment(
                                    selectedOrder.id,
                                    record.installmentNumber
                                  )
                                }
                              >
                                Xác nhận thanh toán
                              </Button>
                            );
                          }

                          return <Text type="secondary">Không khả dụng</Text>;
                        },
                      },
                    ]}
                  />
                </Card>
              )}
          </div>
        )}
      </Modal>

      {/* Attach Vehicle Modal */}
      <Modal
        title={
          <span>
            <CarOutlined className="mr-2" />
            Gắn xe vào đơn hàng
          </span>
        }
        open={attachVehicleModalVisible}
        onCancel={() => {
          setAttachVehicleModalVisible(false);
          setSelectedVehicle(null);
        }}
        width={800}
        footer={
          <Space>
            <Button
              onClick={() => {
                setAttachVehicleModalVisible(false);
                setSelectedVehicle(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={attachVehicleLoading}
              onClick={() => {
                if (selectedOrder && selectedVehicle) {
                  handleAttachVehicle(selectedOrder.id, selectedVehicle.id);
                }
              }}
              icon={<CarOutlined />}
              disabled={!selectedVehicle}
            >
              Gắn xe
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <div>
            <Card className="mb-4" size="small">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đại lý">
                  <Text>
                    {selectedOrder.dealer?.name} ({selectedOrder.dealer?.code})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Model yêu cầu">
                  <Text>
                    {selectedOrder.requestedModelColor?.modelName} -{" "}
                    {selectedOrder.requestedModelColor?.colorName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hiện tại">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="bg-orange-50 p-4 rounded-lg mb-4">
              <Text strong className="text-orange-800">
                Lưu ý:
              </Text>
              <ul className="mt-2 text-sm text-orange-700 list-disc pl-5">
                <li>Chọn xe có trạng thái AVAILABLE để gắn vào đơn hàng</li>
                <li>Xe phải khớp với model và màu mà dealer đã yêu cầu</li>
                <li>Sau khi gắn xe, đơn hàng có thể được phê duyệt</li>
                <li>Hành động này không thể hoàn tác</li>
              </ul>
            </div>

            <div>
              <Text strong className="text-lg mb-3 block">
                Danh sách xe có sẵn:
              </Text>
              {loadingVehicles ? (
                <div className="text-center py-8">
                  <Text>Đang tải danh sách xe...</Text>
                </div>
              ) : availableVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Text type="secondary">Không có xe nào khả dụng</Text>
                </div>
              ) : (
                <Table
                  dataSource={availableVehicles}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedVehicle
                      ? [selectedVehicle.id]
                      : [],
                    onSelect: (record) => {
                      setSelectedVehicle(record);
                    },
                  }}
                  columns={[
                    {
                      title: "VIN",
                      dataIndex: "vin",
                      key: "vin",
                      width: 180,
                      render: (vin) => (
                        <Text className="font-mono text-xs">{vin}</Text>
                      ),
                    },
                    {
                      title: "Engine Number",
                      dataIndex: "engineNumber",
                      key: "engineNumber",
                      width: 140,
                      render: (engineNumber) => (
                        <Text className="font-mono text-xs">
                          {engineNumber}
                        </Text>
                      ),
                    },
                    {
                      title: "Model",
                      dataIndex: "modelName",
                      key: "modelName",
                      width: 120,
                    },
                    {
                      title: "Màu",
                      dataIndex: "colorName",
                      key: "colorName",
                      width: 100,
                      render: (color) => <Tag color="blue">{color}</Tag>,
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      width: 100,
                      render: (status) => {
                        const getStatusInfo = (status) => {
                          switch (status) {
                            case "AVAILABLE":
                              return { color: "green", text: "Có sẵn" };
                            case "IN_STOCK":
                              return { color: "blue", text: "Trong kho" };
                            case "RESERVED":
                              return { color: "orange", text: "Đã đặt" };
                            case "SOLD":
                              return { color: "red", text: "Đã bán" };
                            default:
                              return { color: "default", text: status };
                          }
                        };

                        const { color, text } = getStatusInfo(status);
                        return <Tag color={color}>{text}</Tag>;
                      },
                    },
                    {
                      title: "Đại lý hiện tại",
                      dataIndex: "dealerName",
                      key: "dealerName",
                      width: 150,
                      render: (dealerName) => (
                        <Text type="secondary" className="text-xs">
                          {dealerName || "Chưa gán"}
                        </Text>
                      ),
                    },
                    {
                      title: "Giá trị",
                      dataIndex: "currentValue",
                      key: "currentValue",
                      width: 130,
                      render: (value) => (
                        <Text strong className="text-xs">
                          {formatCurrency(value)}
                        </Text>
                      ),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Installment Confirmation Modal */}
      <Modal
        title={
          <span>
            <CheckCircleOutlined className="mr-2" />
            Xác nhận kỳ thanh toán trả góp
          </span>
        }
        open={installmentModalVisible}
        onCancel={() => {
          setInstallmentModalVisible(false);
          setSelectedInstallmentId(null);
        }}
        width={700}
        footer={
          <Space>
            <Button
              onClick={() => {
                setInstallmentModalVisible(false);
                setSelectedInstallmentId(null);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={confirmInstallmentLoading[selectedOrder?.id]}
              onClick={() => {
                if (selectedOrder && selectedInstallmentId) {
                  handleConfirmInstallmentPayment(
                    selectedOrder.id,
                    selectedInstallmentId
                  );
                }
              }}
              icon={<CheckCircleOutlined />}
              disabled={!selectedInstallmentId}
            >
              Xác nhận thanh toán
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <div>
            <Card className="mb-4" size="small">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đại lý">
                  <Text>
                    {selectedOrder.dealer?.name} ({selectedOrder.dealer?.code})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Hình thức thanh toán">
                  <Tag color="blue">Trả góp</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền đơn hàng">
                  <Text strong className="text-lg text-blue-600">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đã thanh toán">
                  <Text strong className="text-lg text-green-600">
                    {formatCurrency(selectedOrder.paidAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Còn lại">
                  <Text strong className="text-lg text-orange-600">
                    {formatCurrency(selectedOrder.remainingAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiến độ thanh toán">
                  <Progress percent={selectedOrder.paymentProgress} />
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hiện tại">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <Text strong className="text-blue-800">
                Lưu ý:
              </Text>
              <ul className="mt-2 text-sm text-blue-700 list-disc pl-5">
                <li>Chọn kỳ thanh toán mà dealer đã hoàn thành</li>
                <li>Chỉ có thể xác nhận các kỳ thanh toán đến hạn</li>
                <li>Kỳ thanh toán sẽ được đánh dấu là đã hoàn thành</li>
                <li>Tiến độ thanh toán sẽ được cập nhật tự động</li>
                <li>Hành động này không thể hoàn tác</li>
              </ul>
            </div>

            <div>
              <Text strong className="block mb-3">
                Lịch trình thanh toán:
              </Text>

              {selectedOrder.installmentSchedule &&
              selectedOrder.installmentSchedule.length > 0 ? (
                <Table
                  dataSource={selectedOrder.installmentSchedule}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedInstallmentId
                      ? [selectedInstallmentId]
                      : [],
                    onSelect: (record) => {
                      setSelectedInstallmentId(record.id);
                    },
                    getCheckboxProps: (record) => ({
                      disabled:
                        record.status === "PAID" ||
                        record.status === "COMPLETED",
                    }),
                  }}
                  columns={[
                    {
                      title: "Kỳ",
                      dataIndex: "installmentNumber",
                      key: "installmentNumber",
                      width: 60,
                      render: (num) => <Text strong>#{num}</Text>,
                    },
                    {
                      title: "Ngày đến hạn",
                      dataIndex: "dueDate",
                      key: "dueDate",
                      width: 120,
                      render: (date) => formatDateTime(date),
                    },
                    {
                      title: "Số tiền",
                      dataIndex: "amount",
                      key: "amount",
                      width: 120,
                      render: (amount) => (
                        <Text strong className="text-blue-600">
                          {formatCurrency(amount)}
                        </Text>
                      ),
                    },
                    {
                      title: "Trạng thái",
                      dataIndex: "status",
                      key: "status",
                      width: 100,
                      render: (status) => {
                        const getColor = (s) => {
                          switch (s) {
                            case "PENDING":
                              return "orange";
                            case "PAID":
                              return "green";
                            case "COMPLETED":
                              return "blue";
                            case "OVERDUE":
                              return "red";
                            default:
                              return "default";
                          }
                        };

                        const getLabel = (s) => {
                          switch (s) {
                            case "PENDING":
                              return "Chờ thanh toán";
                            case "PAID":
                              return "Đã thanh toán";
                            case "COMPLETED":
                              return "Hoàn thành";
                            case "OVERDUE":
                              return "Quá hạn";
                            default:
                              return s;
                          }
                        };

                        return (
                          <Tag color={getColor(status)}>{getLabel(status)}</Tag>
                        );
                      },
                    },
                    {
                      title: "Ngày thanh toán",
                      dataIndex: "paidDate",
                      key: "paidDate",
                      width: 120,
                      render: (date) => (date ? formatDateTime(date) : "-"),
                    },
                  ]}
                />
              ) : (
                <div className="text-center py-4">
                  <Text type="secondary">Chưa có lịch trình thanh toán</Text>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Payment Modal */}
      <Modal
        title={
          <span>
            <DollarCircleOutlined className="mr-2" />
            Nhập thanh toán - Đơn trả thẳng
          </span>
        }
        open={manualPaymentModalVisible}
        onCancel={() => {
          setManualPaymentModalVisible(false);
          setManualPaymentAmount(0);
          setManualPaymentNotes("");
        }}
        width={600}
        footer={
          <Space>
            <Button
              onClick={() => {
                setManualPaymentModalVisible(false);
                setManualPaymentAmount(0);
                setManualPaymentNotes("");
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={manualPaymentLoading[selectedOrder?.id]}
              onClick={() => {
                if (selectedOrder && manualPaymentAmount > 0) {
                  // FIX: Re-calculate amounts here to ensure validation is correct, mirroring the modal's display logic.
                  const totalAmount = selectedOrder.totalAmount;
                  let paidAmount = selectedOrder.paidAmount || 0;

                  // This is the same workaround as the display logic.
                  if (
                    !selectedOrder.isInstallment &&
                    selectedOrder.status === "PAID" &&
                    paidAmount >= totalAmount
                  ) {
                    paidAmount = totalAmount * 0.5;
                  }
                  const remainingAmount = totalAmount - paidAmount;

                  let minRequired = 0;
                  let validationMsg = "";

                  // Lần 1: Ít nhất 50% tổng đơn
                  if (paidAmount === 0) {
                    minRequired = totalAmount * 0.5;
                    validationMsg = `Lần thanh toán đầu tiên phải ít nhất 50% tổng đơn hàng (${formatCurrency(
                      minRequired
                    )})`;
                  }
                  // Lần 2+: Ít nhất 50% số còn lại
                  else {
                    minRequired = remainingAmount * 0.5;
                    validationMsg = `Thanh toán tiếp theo phải ít nhất 50% số tiền còn lại (${formatCurrency(
                      minRequired
                    )}) hoặc tất cả`;
                  }

                  // Kiểm tra: Số tiền nhập < mức tối thiểu VÀ Số tiền nhập < toàn bộ số còn lại
                  // Cho phép sai số nhỏ (1đ) để tránh lỗi làm tròn
                  if (
                    manualPaymentAmount < minRequired - 1 &&
                    manualPaymentAmount < remainingAmount - 1
                  ) {
                    message.error(validationMsg);
                    return;
                  }

                  handleManualPayment(
                    selectedOrder.id,
                    manualPaymentAmount,
                    manualPaymentNotes
                  );
                }
              }}
              icon={<DollarCircleOutlined />}
              disabled={!manualPaymentAmount || manualPaymentAmount <= 0}
            >
              Cập nhật thanh toán
            </Button>
          </Space>
        }
      >
        {selectedOrder &&
          (() => {
            // WORKAROUND: Because backend sends incorrect paidAmount when status is PAID,
            // we must recalculate the display values here.
            const total = selectedOrder.totalAmount || 0;
            let paid = selectedOrder.paidAmount || 0;

            // If it's a straight payment, status is PAID, and API says it's fully paid,
            // we assume it's actually 50% paid. This is the core of the workaround.
            if (
              !selectedOrder.isInstallment &&
              selectedOrder.status === "PAID" &&
              paid >= total
            ) {
              paid = total * 0.5;
            }

            const remaining = total - paid;
            const minNextPayment = remaining * 0.5;

            return (
              <div>
                <Card className="mb-4" size="small">
                  <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Mã đơn hàng">
                      <Text strong>{selectedOrder.orderCode}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Đại lý">
                      <Text>
                        {selectedOrder.dealer?.name} (
                        {selectedOrder.dealer?.code})
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Hình thức thanh toán">
                      <Tag
                        color={selectedOrder.isInstallment ? "blue" : "green"}
                      >
                        {selectedOrder.isInstallment
                          ? "Trả góp"
                          : "Thanh toán 1 lần"}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">
                      <Text strong className="text-lg">
                        {formatCurrency(total)}
                      </Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tiến độ thanh toán">
                      <Progress
                        percent={
                          total > 0 ? Math.floor((paid / total) * 100) : 0
                        }
                      />
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái hiện tại">
                      <Tag color={getStatusColor(selectedOrder.status)}>
                        {getStatusLabel(selectedOrder.status)}
                      </Tag>
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <Text strong className="text-green-800">
                    Quy định thanh toán (Tối đa 3 lần):
                  </Text>
                  <ul className="mt-2 text-sm text-green-700 list-disc pl-5">
                    <li>
                      <b>Lần 1:</b> Thanh toán ít nhất <b>50%</b> tổng giá trị
                      đơn hàng.
                    </li>
                    <li>
                      <b>Lần 2:</b> Thanh toán ít nhất <b>50%</b> số tiền còn
                      lại.
                    </li>
                    <li>
                      <b>Lần 3:</b> Thanh toán toàn bộ phần còn lại (Hoàn tất).
                    </li>
                    <li>
                      Phải thanh toán đủ <b>100%</b> mới có thể bắt đầu vận
                      chuyển.
                    </li>
                  </ul>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số tiền dealer đã thanh toán:{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <InputNumber
                    value={manualPaymentAmount}
                    onChange={(value) => setManualPaymentAmount(value || 0)}
                    placeholder="Nhập số tiền thanh toán..."
                    className="w-full"
                    min={0}
                    max={remaining} // FIX: Use the correctly calculated remaining amount
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                    addonAfter="VND"
                  />
                  <div className="mt-1 text-xs text-gray-500">
                    {paid === 0 ? (
                      <span className="text-orange-600 font-medium">
                        Tối thiểu lần 1: {formatCurrency(total * 0.5)}
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium">
                        Tối thiểu lần này: {formatCurrency(minNextPayment)}
                      </span>
                    )}
                    <span className="mx-2">|</span>
                    Còn lại cần thanh toán: {formatCurrency(remaining)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú thanh toán:
                  </label>
                  <Input.TextArea
                    value={manualPaymentNotes}
                    onChange={(e) => setManualPaymentNotes(e.target.value)}
                    placeholder="Nhập ghi chú về việc thanh toán (tùy chọn)..."
                    rows={3}
                    maxLength={500}
                    showCount
                  />
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* Deposit Confirmation Modal */}
      <Modal
        title={
          <span>
            <DollarOutlined className="mr-2" />
            Xác nhận tiền cọc - Đơn trả góp
          </span>
        }
        open={depositModalVisible}
        onCancel={() => {
          setDepositModalVisible(false);
          setDepositNotes("");
          setDepositAmount(0);
        }}
        width={600}
        footer={
          <Space>
            <Button
              onClick={() => {
                setDepositModalVisible(false);
                setDepositNotes("");
                setDepositAmount(0);
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              loading={confirmDepositLoading[selectedOrder?.id]}
              onClick={() => {
                if (selectedOrder && depositAmount > 0) {
                  handleConfirmDeposit(
                    selectedOrder.id,
                    depositAmount,
                    depositNotes
                  );
                }
              }}
              icon={<DollarOutlined />}
              disabled={!depositAmount || depositAmount <= 0}
            >
              Xác nhận tiền cọc
            </Button>
          </Space>
        }
      >
        {selectedOrder && (
          <div>
            <Card className="mb-4" size="small">
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="Mã đơn hàng">
                  <Text strong>{selectedOrder.orderCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Đại lý">
                  <Text>
                    {selectedOrder.dealer?.name} ({selectedOrder.dealer?.code})
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền đơn hàng">
                  <Text strong className="text-lg text-blue-600">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tiền cọc">
                  <Text strong className="text-lg text-orange-600">
                    {formatCurrency(selectedOrder.depositAmount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hiện tại">
                  <Tag color={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <Text strong className="text-blue-800">
                Lưu ý:
              </Text>
              <ul className="mt-2 text-sm text-blue-700 list-disc pl-5">
                <li>Nhập số tiền cọc thực tế mà dealer đã thanh toán</li>
                <li>
                  Xác nhận rằng dealer đã nộp tiền cọc cho đơn hàng trả góp
                </li>
                <li>Sau khi xác nhận, tiến độ thanh toán sẽ được cập nhật</li>
                <li>
                  Đơn hàng có thể chuyển sang trạng thái "Đã xác nhận cọc"
                  (PAID)
                </li>
                <li>Hành động này không thể hoàn tác</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số tiền cọc dealer đã thanh toán:{" "}
                <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={depositAmount}
                onChange={(value) => setDepositAmount(value || 0)}
                placeholder="Nhập số tiền cọc..."
                className="w-full"
                min={0}
                max={selectedOrder?.totalAmount}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                addonAfter="VND"
              />
              <div className="mt-1 text-xs text-gray-500">
                Tiền cọc dự kiến: {formatCurrency(selectedOrder?.depositAmount)}{" "}
                | Tối đa: {formatCurrency(selectedOrder?.totalAmount)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú xác nhận:
              </label>
              <Input.TextArea
                value={depositNotes}
                onChange={(e) => setDepositNotes(e.target.value)}
                placeholder="Nhập ghi chú về việc xác nhận tiền cọc (tùy chọn)..."
                rows={3}
                maxLength={500}
                showCount
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Defects Modal */}
      <Modal
        open={defectsModalVisible}
        onCancel={() => {
          setDefectsModalVisible(false);
          setDefects([]);
        }}
        title="Danh sách báo cáo xe lỗi"
        footer={[
          <Button key="close" onClick={() => setDefectsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={1000}
      >
        <Spin spinning={loadingDefects}>
          {defects.length === 0 ? (
            <Empty
              description="Không có báo cáo xe lỗi nào trong đơn hàng này"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <Table
              rowKey="id"
              columns={[
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
                  title: "Lý do",
                  dataIndex: "reason",
                  key: "reason",
                  ellipsis: true,
                },
                {
                  title: "Đã phê duyệt",
                  dataIndex: "isApproved",
                  key: "isApproved",
                  render: (isApproved) => (
                    <Tag color={isApproved ? "green" : "orange"}>
                      {isApproved ? "Đã phê duyệt" : "Chờ phê duyệt"}
                    </Tag>
                  ),
                },
                {
                  title: "Đã sửa xong",
                  dataIndex: "isRepairCompleted",
                  key: "isRepairCompleted",
                  render: (isRepairCompleted) => (
                    <Tag color={isRepairCompleted ? "green" : "default"}>
                      {isRepairCompleted ? "Đã sửa xong" : "Chưa sửa"}
                    </Tag>
                  ),
                },
                {
                  title: "Ngày báo cáo",
                  dataIndex: "reportedAt",
                  key: "reportedAt",
                  render: (date) => (date ? formatDateTime(date) : "-"),
                },
                {
                  title: "Thao tác",
                  key: "action",
                  width: 250,
                  render: (_, record) => {
                    const orderId = selectedOrder?.id;
                    return (
                      <Space size="small" direction="vertical">
                        {!record.isApproved && (
                          <Popconfirm
                            title="Phê duyệt báo cáo xe lỗi"
                            description="Bạn có chắc chắn muốn phê duyệt báo cáo này? Xe lỗi hợp lệ và sẽ tiến hành sửa chữa?"
                            onConfirm={() => handleApproveDefectReport(orderId)}
                            okText="Phê duyệt"
                            cancelText="Hủy"
                            okButtonProps={{
                              type: "primary",
                              loading: approveDefectLoading[orderId],
                            }}
                          >
                            <Button
                              type="link"
                              size="small"
                              loading={approveDefectLoading[orderId]}
                              disabled={
                                approveDefectLoading[orderId] ||
                                completeRepairLoading[orderId] ||
                                rejectDefectLoading[orderId]
                              }
                            >
                              Phê duyệt
                            </Button>
                          </Popconfirm>
                        )}
                        {record.isApproved && !record.isRepairCompleted && (
                          <Popconfirm
                            title="Xác nhận sửa xe lỗi hoàn tất"
                            description="Bạn có chắc chắn xe lỗi đã được sửa xong và chuẩn bị gửi lại dealer?"
                            onConfirm={() => handleCompleteRepair(orderId)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{
                              type: "primary",
                              loading: completeRepairLoading[orderId],
                            }}
                          >
                            <Button
                              type="link"
                              size="small"
                              loading={completeRepairLoading[orderId]}
                              disabled={
                                approveDefectLoading[orderId] ||
                                completeRepairLoading[orderId] ||
                                rejectDefectLoading[orderId]
                              }
                            >
                              Hoàn tất sửa chữa
                            </Button>
                          </Popconfirm>
                        )}
                        {!record.isApproved && (
                          <Popconfirm
                            title="Từ chối báo cáo xe lỗi"
                            description="Bạn có chắc chắn muốn từ chối báo cáo này? Xe không lỗi?"
                            onConfirm={() => handleRejectDefectReport(orderId)}
                            okText="Xác nhận"
                            cancelText="Hủy"
                            okButtonProps={{ danger: true }}
                          >
                            <Button
                              type="link"
                              danger
                              size="small"
                              loading={rejectDefectLoading[orderId]}
                              disabled={
                                record.isApproved ||
                                record.isRepairCompleted ||
                                approveDefectLoading[orderId] ||
                                completeRepairLoading[orderId] ||
                                rejectDefectLoading[orderId]
                              }
                            >
                              Từ chối
                            </Button>
                          </Popconfirm>
                        )}
                      </Space>
                    );
                  },
                },
              ]}
              dataSource={defects}
              pagination={false}
              size="small"
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
}
