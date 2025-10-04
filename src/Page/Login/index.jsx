import AuthenTemplate from "../../components/authen-template";
import { Button, Form, Input, Divider, Typography } from "antd";
import { getAuth, signInWithPopup } from "firebase/auth";
import { googleProvider } from "../../config/firebase";
import { GoogleAuthProvider } from "firebase/auth/web-extension";
import {
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";
import { useDispatch } from "react-redux";
import { login } from "../../redux/features/userSlice";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLoginGoogle = () => {
    const auth = getAuth();
    signInWithPopup(auth, googleProvider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log(user);

        // You can dispatch login action or store the user info here
        dispatch(login({ user, token }));
        localStorage.setItem("token", token);
        toast.success("Google login successful!");
        navigate("/dashboard");
      })
      .catch((error) => {
        toast.error("Google login failed!");
        console.error(error);
      });
  };

  const handleLogin = async (values) => {
    try {
      const response = await api.post("", values);
      console.log("response", response);

      const { role, token } = response.data;
      dispatch(login(response.data));
      localStorage.setItem("token", token);

      toast.success("Login successful!");
      if (role === "ADMIN") {
        navigate("/dashboard");
      } else {
        navigate("/"); // Redirect to another page for non-admin users
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed!";
      toast.error(errorMessage);
    }
  };

  return (
    <AuthenTemplate>
      <Form labelCol={{ span: 24 }} onFinish={handleLogin} layout="vertical">
        <Typography.Title level={3} style={{ marginBottom: 8 }}>
          Welcome back
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Sign in to continue to your account
        </Typography.Paragraph>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please enter a valid email!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="you@example.com"
            size="large"
          />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            size="large"
          />
        </Form.Item>
        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" block>
            Login <ArrowRightOutlined />
          </Button>
        </Form.Item>
        <Divider plain>or</Divider>
        <Button
          icon={<GoogleOutlined />}
          onClick={handleLoginGoogle}
          size="large"
          block
        >
          Continue with Google
        </Button>
        <div style={{ marginTop: 16 }}>
          <Link to="/register">Do not have an account? Create one</Link>
        </div>
      </Form>
    </AuthenTemplate>
  );
}

export default LoginPage;
