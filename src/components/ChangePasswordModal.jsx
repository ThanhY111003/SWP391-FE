import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import api from "../config/axios";

const ChangePasswordModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values) => {
    const { oldPassword, newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("auth/change-password", {
        oldPassword,
        newPassword,
        confirmPassword,
      });

      message.success("Đổi mật khẩu thành công!");
      form.resetFields();
      onSuccess(); // Callback to handle successful password change
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        "Đổi mật khẩu thất bại! Vui lòng thử lại.";
      message.error(errorMessage);
      console.error("Change password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined className="text-orange-500" />
          <span>Yêu cầu đổi mật khẩu</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      closable={false}
      maskClosable={false}
      width={500}
      centered
    >
      <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-orange-800 mb-0">
          <strong>Tài khoản của bạn chưa được đổi mật khẩu!</strong>
        </p>
        <p className="text-orange-700 mb-0 text-sm">
          Vui lòng đổi mật khẩu để tiếp tục sử dụng hệ thống.
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleChangePassword}
        autoComplete="off"
      >
        <Form.Item
          label="Mật khẩu cũ"
          name="oldPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu cũ!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu cũ"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            prefix={<LockOutlined className="text-gray-400" />}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            className="bg-blue-500 hover:bg-blue-600"
          >
            Đổi mật khẩu
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;