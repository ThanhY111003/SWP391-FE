import { useState } from "react";
import { Input, Button, message, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async () => {
    setLoading(true);
    try {
      // BE API: POST /api/auth/login
      // Request: { username, password }
      // Response: { token, role, username }
      //const res = await axios.post("http://localhost:8080/api/auth/login", form);
      const { role, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("username", res.data.username);

      // Điều hướng theo role
      if (role === "ADMIN") navigate("/admin/users");
      else if (role === "EVM_STAFF") navigate("/evm/users");
      else if (role === "DEALER_MANAGER") navigate("/dealer/users");
      else navigate("/dealer/dashboard");
    } catch (err) {
      message.error("Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-[400px]" title="Đăng nhập EVMS">
        <Input
          placeholder="Tên đăng nhập"
          className="mb-3"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />
        <Input.Password
          placeholder="Mật khẩu"
          className="mb-3"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Button
          type="primary"
          className="w-full"
          loading={loading}
          onClick={handleLogin}
        >
          Đăng nhập
        </Button>
      </Card>
    </div>
  );
}
