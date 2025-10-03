import AuthenTemplate from "../../components/authen-template";
import { Button, Form, Input, Typography, Divider } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../config/axios";
import { MailOutlined, PhoneOutlined, UserOutlined, LockOutlined, ArrowRightOutlined } from "@ant-design/icons";

function RegisterPage() {
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    console.log(values);
    const registerData = {
      email: values.email,
      firstName: values.firstname,
      lastName: values.lastname,
      birthday: "2024-10-19T06:37:23.807Z",
      gender: "male",
      phone: values.phone,
      password: values.confirmPassword,
      role: "CUSTOMER",
    };

    // submit xuống backend
    try {
      values.role = "CUSTOMER";
      const response = await api.post(
        "http://localhost:8080/api/register",
        registerData
      );

      toast.success("Successfully registier new account!");
      navigate("/login");
    } catch (err) {
      //console.log
      toast.error(err.response.data);
    }
  };

  return (
    <AuthenTemplate>
      <Form
        labelCol={{
          span: 24,
        }}
        onFinish={handleRegister}
        layout="vertical"
      >
        <Typography.Title level={3} style={{ marginBottom: 8 }}>Create account</Typography.Title>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Join us and start using our services
        </Typography.Paragraph>
        <Form.Item
          label="First Name"
          name="firstname"
          rules={[{ required: true, message: "Please input your firstname!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nguyen" size="large" />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lastname"
          rules={[{ required: true, message: "Please input your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Van A" size="large" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input your password!" },
            { min: 6, message: "Password must be at least 6 characters long!" },
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="••••••••" size="large" />
        </Form.Item>

        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Repeat password" size="large" />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: "Please input your phone number!" },
            {
              pattern: /^((\+84)|0)([1-9]{1}[0-9]{8})$/,
              message: "Please enter a valid Vietnamese phone number!",
            },
          ]}
        >
          <Input prefix={<PhoneOutlined />} placeholder="0901234567" size="large" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            {
              type: "email",
              message: "Please enter a valid email!",
            },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
        </Form.Item>
        <Form.Item style={{ marginTop: 8 }}>
          <Button type="primary" htmlType="submit" size="large" block>
            Register <ArrowRightOutlined />
          </Button>
        </Form.Item>
        <Divider plain />
        <div style={{ marginTop: 0 }}>
          <Link to="/login">Already have an account? Sign in</Link>
        </div>
      </Form>
    </AuthenTemplate>
  );
}

export default RegisterPage;
