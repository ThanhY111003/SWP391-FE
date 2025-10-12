import { useState } from "react";
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
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
    const { username, password } = values;

    setLoading(true);
    try {
      // 🔹 Khi dùng thật: bật dòng dưới, tắt dòng mock
       const res = await axios.post("http://localhost:8080/api/auth/login", values);
      //const res = { data: { token: "fakeToken", role: "ADMIN", username } }; // mock để test

      const { role, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", res.data.username);

      // 🔹 Điều hướng chính xác theo role (đúng với App.jsx)
      switch (role) {
        case "ADMIN":
          navigate("/admin/ManageUsers");
          break;
        case "EVM_STAFF":
          navigate("/evm/ManageDealers");
          break;
        case "DEALER_MANAGER":
          navigate("/dealer/dashboard");
          break;
        default:
          navigate("/dealer/dashboard");
      }

      message.success("Đăng nhập thành công!");
    } catch (err) {
      message.error("Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-purple-900 to-indigo-800">
      {/* 🔹 Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage:
            "url('https://cdn.pixabay.com/photo/2023/11/12/15/30/suv-8383283_1280.jpg')",
        }}
      />

      {/* 🔹 Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[380px] max-w-[90%]"
      >
        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6"
          bordered={false}
        >
          <Title
            level={2}
            className="text-center text-white mb-6 font-semibold tracking-wide"
          >
            Login
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
                { min: 3, message: "Username must be at least 3 characters!" },
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
                { min: 6, message: "Password must be at least 6 characters!" },
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

            <Divider className="border-gray-400 my-5" />

            <div className="text-center">
              <span className="text-white">Chưa có tài khoản? </span>
              <Link
                to="/register"
                className="text-purple-300 hover:text-purple-200 transition font-medium"
              >
                Đăng ký ngay
              </Link>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
