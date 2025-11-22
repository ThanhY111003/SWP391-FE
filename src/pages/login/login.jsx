import { useState } from "react";
import toast from "react-hot-toast";
import {
  Form,
  Input,
  Checkbox,
  Button,
  Card,
  Divider,
  Row,
  Col,
  message,
  Typography,
} from "antd";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"; // used for animations in heading and button
import api from "../../config/axios";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleLogin = async (values) => {
    const { username } = values;

    setLoading(true);
    try {
      // Gọi API login thật
      const res = await api.post("auth/login", values);

      // Linh hoạt với nhiều định dạng trả về khác nhau của BE
      const raw = res?.data ?? {};
      const payload = raw?.data ?? raw; // một số BE bọc data bên trong 'data'

      // Lấy token theo nhiều khả năng khác nhau
      const tokenFromHeader = res?.headers?.authorization?.startsWith("Bearer ")
        ? res.headers.authorization.slice(7)
        : undefined;
      const token =
        payload?.token ||
        payload?.accessToken ||
        raw?.token ||
        raw?.accessToken ||
        tokenFromHeader;

      const refreshToken = payload?.refreshToken || raw?.refreshToken;

      // Lấy role
      let roleName =
        payload?.roleName ||
        payload?.role ||
        raw?.roleName ||
        (Array.isArray(payload?.roles) ? payload.roles[0] : undefined);
      if (typeof roleName === "string") {
        roleName = roleName.replace(/^ROLE_/, "");
      }

      // Lấy username
      const responseUsername =
        payload?.username || payload?.userName || payload?.user?.username;

      // Kiểm tra mustChangePassword
      const mustChangePassword =
        payload?.mustChangePassword || raw?.mustChangePassword;

      // Điều kiện thành công: có 'token' là đủ
      if (token) {
        // Lưu thông tin vào localStorage
        localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (roleName) localStorage.setItem("role", roleName);
        localStorage.setItem("username", responseUsername || username);

        // Kiểm tra nếu user vừa reset password thành công
        const passwordResetSuccess = localStorage.getItem(
          "passwordResetSuccess"
        );
        const resetEmail = localStorage.getItem("resetEmail");

        // Nếu vừa reset password và email khớp, bỏ qua yêu cầu đổi mật khẩu
        if (
          passwordResetSuccess === "true" &&
          resetEmail === (responseUsername || username)
        ) {
          // Xóa flag reset password
          localStorage.removeItem("passwordResetSuccess");
          localStorage.removeItem("resetEmail");
          // Bỏ qua mustChangePassword và tiếp tục redirect
        } else if (mustChangePassword === true) {
          // Lưu thông tin đăng nhập để sử dụng sau khi đổi mật khẩu
          setLoginCredentials({
            token,
            roleName,
            username: responseUsername || username,
            refreshToken,
          });
          setShowChangePasswordModal(true);
          return; // Dừng lại ở đây, không redirect
        }

        toast.success(`Welcome back, ${responseUsername || username}!`, {
          duration: 2500,
          style: {
            background: "linear-gradient(to right, #a855f7, #6366f1)",
            color: "white",
            borderRadius: "10px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
          },
          iconTheme: {
            primary: "white",
            secondary: "#7c3aed",
          },
        });

        // 🔹 Điều hướng chính xác theo roleName từ API
        switch (roleName) {
          case "ADMIN":
            navigate("/manufacturer/reports");
            break;
          case "EVM_STAFF":
            navigate("/dealer/vehicle-list");
            break;
          case "MANUFACTURER":
            navigate("/manufacturer/reports");
            break;
          default:
            message.warning("Unknown role, redirecting to default page");
            navigate("/dealer/vehicle-list");
        }
        message.success(raw?.message || "Login successfully!");
      } else {
        // Không có token trong response
        message.error(
          raw?.message ||
            "Login failed! Backend did not return a token. Please check API response."
        );
      }
    } catch (err) {
      // Xử lý lỗi từ API
      const errorMessage =
        err.response?.data?.message || "Invalid username or password!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePasswordSuccess = () => {
    // Đóng modal
    setShowChangePasswordModal(false);

    // Hiển thị thông báo thành công
    toast.success(
      `Đổi mật khẩu thành công! Welcome back, ${loginCredentials?.username}!`,
      {
        duration: 2500,
        style: {
          background: "linear-gradient(to right, #10b981, #059669)",
          color: "white",
          borderRadius: "10px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        },
        iconTheme: {
          primary: "white",
          secondary: "#047857",
        },
      }
    );

    // Redirect theo role
    if (loginCredentials) {
      const { roleName } = loginCredentials;
      switch (roleName) {
        case "ADMIN":
          navigate("/manufacturer/reports");
          break;
        case "EVM_STAFF":
          navigate("/dealer/vehicle-list");
          break;
        case "MANUFACTURER":
          navigate("/manufacturer/reports");
          break;
        default:
          message.warning("Unknown role, redirecting to default page");
          navigate("/dealer/vehicle-list");
      }
    }
  };

  const handleCloseChangePasswordModal = () => {
    // Người dùng không thể đóng modal này mà không đổi mật khẩu
    // Modal sẽ chỉ đóng khi đổi mật khẩu thành công
  };

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    setShowForgotPasswordModal(true);
  };

  const handleCloseForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
  };

  return (
    <>
      <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900 to-indigo-800">
        {/* 🔹 Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{
            backgroundImage:
              "url('https://cdn.pixabay.com/photo/2023/11/12/15/30/suv-8383283_1280.jpg')",
          }}
        />

        {/* 🔹 ELECTRIC VEHICLES Title */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute top-17 text-6xl font-extrabold text-white tracking-wide drop-shadow-lg"
        >
          ELECTRIC VEHICLES
        </motion.h1>

        {/* 🔹 Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 w-[380px] max-w-[90%]"
        >
          <Card
            className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6"
            variant="borderless"
          >
            <Title
              level={2}
              className="text-center text-white mb-6 font-semibold tracking-wide"
            >
              Welcome Back
            </Title>

            <Form
              form={form}
              name="loginForm"
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
            >
              <Form.Item
                label={<span className="text-black font-medium">Username</span>}
                name="username"
                rules={[
                  { required: true, message: "Please enter your username!" },
                  {
                    min: 3,
                    message: "Username must be at least 3 characters!",
                  },
                ]}
              >
                <Input
                  placeholder="Enter your username"
                  size="large"
                  className="rounded-full bg-white/20 text-black placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-black font-medium">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  size="large"
                  className="rounded-full bg-white/20 text-white placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                />
              </Form.Item>

              <Row justify="space-between" align="middle" className="text-sm">
                <Col>
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="text-white">Remember me</Checkbox>
                  </Form.Item>
                </Col>
                <Col>
                  <a
                    href="#"
                    onClick={handleForgotPasswordClick}
                    className="text-purple-300 hover:text-purple-200 transition"
                  >
                    Forgot password?
                  </a>
                </Col>
              </Row>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4"
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  className="rounded-full bg-white text-purple-700 font-semibold hover:bg-purple-100 border-none"
                >
                  Login
                </Button>
              </motion.div>
            </Form>
          </Card>
        </motion.div>
      </div>

      {/* 🔹 Change Password Modal */}
      <ChangePasswordModal
        visible={showChangePasswordModal}
        onClose={handleCloseChangePasswordModal}
        onSuccess={handleChangePasswordSuccess}
      />

      {/* 🔹 Forgot Password Modal */}
      <ForgotPasswordModal
        visible={showForgotPasswordModal}
        onClose={handleCloseForgotPasswordModal}
      />
    </>
  );
}
