import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Divider,
  Row,
  Col,
  message,
  Typography,
  Select,
} from "antd";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

const { Title } = Typography;
const { Option } = Select;

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values) => {
    const { username, password, email, fullName, phone, role } = values;

    setLoading(true);
    try {
      // 🔹 Gọi API đăng ký
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        username,
        password,
        email,
        fullName,
        phone,
        role: role || "DEALER_MANAGER", // Mặc định là DEALER_MANAGER
      });

      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.message) {
        message.error(err.response.data.message);
      } else {
        message.error("Đăng ký thất bại! Vui lòng thử lại.");
      }
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

      {/* 🔹 Register Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-[450px] max-w-[90%]"
      >
        <Card
          className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl p-6"
          bordered={false}
        >
          <Title
            level={2}
            className="text-center text-white mb-6 font-semibold tracking-wide"
          >
            Đăng Ký
          </Title>

          <Form
            form={form}
            name="registerForm"
            layout="vertical"
            onFinish={handleRegister}
            autoComplete="off"
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-black font-medium">Họ và tên</span>}
                  name="fullName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên!" },
                    { min: 2, message: "Họ và tên phải có ít nhất 2 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập họ và tên"
                    size="large"
                    className="rounded-full bg-white/20 text-black placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-black font-medium">Tên đăng nhập</span>}
                  name="username"
                  rules={[
                    { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                    { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập tên đăng nhập"
                    size="large"
                    className="rounded-full bg-white/20 text-black placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-black font-medium">Email</span>}
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không hợp lệ!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập email"
                    size="large"
                    className="rounded-full bg-white/20 text-black placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={<span className="text-black font-medium">Số điện thoại</span>}
                  name="phone"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ!" },
                  ]}
                >
                  <Input
                    placeholder="Nhập số điện thoại"
                    size="large"
                    className="rounded-full bg-white/20 text-black placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label={<span className="text-black font-medium">Vai trò</span>}
              name="role"
              rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
            >
              <Select
                placeholder="Chọn vai trò"
                size="large"
                className="rounded-full"
              >
                <Option value="DEALER_MANAGER">Quản lý đại lý</Option>
                <Option value="EVM_STAFF">Nhân viên EVM</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<span className="text-black font-medium">Mật khẩu</span>}
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu"
                size="large"
                className="rounded-full bg-white/20 text-white placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-black font-medium">Xác nhận mật khẩu</span>}
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder="Nhập lại mật khẩu"
                size="large"
                className="rounded-full bg-white/20 text-white placeholder-gray-300 border-none focus:ring-2 focus:ring-purple-400"
              />
            </Form.Item>

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
                Đăng Ký
              </Button>
            </motion.div>

            <Divider className="border-gray-400 my-5" />

            <div className="text-center">
              <span className="text-white">Đã có tài khoản? </span>
              <Link
                to="/login"
                className="text-purple-300 hover:text-purple-200 transition font-medium"
              >
                Đăng nhập ngay
              </Link>
            </div>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}
