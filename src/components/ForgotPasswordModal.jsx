import { useState } from "react";
import { Modal, Form, Input, Button, message, Result, Steps } from "antd";
import { MailOutlined, CheckCircleOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import api from "../config/axios";

const { Step } = Steps;

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Bước 1: Gửi OTP đến email
  const handleSendOTP = async (values) => {
    const { email } = values;

    setLoading(true);
    try {
      const response = await api.post("auth/forgot-password", {
        email,
      });

      console.log("Send OTP response:", response);

      if (response.data?.success || response.status === 200) {
        setEmail(email);
        setCurrentStep(1);
        message.success(
          response.data?.message || "Đã gửi mã OTP đến email của bạn!"
        );
        
        // Bắt đầu cooldown ngay sau khi gửi OTP thành công
        startResendCooldown(180); // Tăng lên 180 giây (3 phút) để giảm spam
      } else {
        message.error(
          response.data?.message || "Có lỗi xảy ra, vui lòng thử lại!"
        );
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        "Không thể gửi email reset password. Vui lòng kiểm tra lại email!";
      message.error(errorMessage);
      console.error("Send OTP error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Nhập OTP và chuyển thẳng sang reset password
  const handleVerifyOTP = async (values) => {
    const { otp } = values;
    setOtpCode(otp);
    setCurrentStep(2);
    message.success("Tiến hành đặt lại mật khẩu!");
  };

  // Bước 3: Đặt lại mật khẩu mới (với OTP)
  const handleResetPassword = async (values) => {
    const { newPassword, confirmPassword } = values;

    if (newPassword !== confirmPassword) {
      message.error("Mật khẩu mới và xác nhận mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    try {
      // Gọi API reset password với OTP
      const response = await api.post("auth/reset-password", {
        email,
        otp: otpCode,
        newPassword,
        confirmPassword,
      });

      console.log("Reset password response:", response);

      if (response.data?.success || response.status === 200) {
        setCurrentStep(3);
        message.success("Đặt lại mật khẩu thành công!");
        
        // Lưu flag để biết đây là reset password thành công
        localStorage.setItem('passwordResetSuccess', 'true');
        localStorage.setItem('resetEmail', email);
      } else {
        message.error(
          response.data?.message || "Có lỗi xảy ra khi đặt lại mật khẩu!"
        );
      }
    } catch (error) {
      const errorMessage = 
        error.response?.data?.message || 
        "Mã OTP không chính xác hoặc không thể đặt lại mật khẩu. Vui lòng thử lại!";
      message.error(errorMessage);
      console.error("Reset password error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    otpForm.resetFields();
    resetForm.resetFields();
    setCurrentStep(0);
    setEmail("");
    setOtpCode("");
    setResendCooldown(0);
    onClose();
  };

  const handleBackToEmail = () => {
    setCurrentStep(0);
    otpForm.resetFields();
    setResendCooldown(0); // Reset cooldown khi quay lại
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) {
      message.warning(`Vui lòng chờ ${resendCooldown} giây trước khi gửi lại!`);
      return;
    }

    setLoading(true);
    try {
      // Thử gọi API resend-otp trước
      let response;
      let useResendAPI = true;
      
      try {
        response = await api.post("auth/forgot-password/resend-otp", {
          email,
        });
        console.log("Resend OTP response:", response);
      } catch (resendError) {
        console.warn("Resend OTP API failed, falling back to forgot-password:", resendError);
        useResendAPI = false;
        
        // Fallback về API forgot-password nếu resend-otp bị lỗi
        response = await api.post("auth/forgot-password", {
          email,
        });
        console.log("Fallback forgot-password response:", response);
      }

      if (response.data?.success || response.status === 200) {
        const successMessage = useResendAPI 
          ? (response.data?.message || "Đã gửi lại mã OTP đến email của bạn!")
          : "Đã gửi lại mã OTP đến email của bạn! (sử dụng phương thức dự phòng)";
          
        message.success(successMessage);
        
        // Tăng cooldown để giảm spam
        startResendCooldown(180); // 180 giây (3 phút)
      } else {
        message.error(
          response.data?.message || "Không thể gửi lại OTP!"
        );
      }
    } catch (error) {
      console.error("Both resend methods failed:", error);
      
      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 429) {
        message.error("Hệ thống đang quá tải. Vui lòng chờ 5 phút rồi thử lại!");
        startResendCooldown(300); // 5 phút cooldown cho lỗi rate limit
      } else if (error.response?.status === 400) {
        message.error("Email không hợp lệ hoặc không tồn tại trong hệ thống!");
        startResendCooldown(180); // 3 phút cooldown cho lỗi này
      } else {
        const errorMessage = 
          error.response?.data?.message || 
          "Không thể gửi lại OTP. Vui lòng thử lại sau ít phút!";
        message.error(errorMessage);
        startResendCooldown(180); // 3 phút cooldown cho các lỗi khác
      }
    } finally {
      setLoading(false);
    }
  };

  const startResendCooldown = (seconds = 180) => {
    setResendCooldown(seconds);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 mb-2">
                <strong>Nhập email để khôi phục mật khẩu</strong>
              </p>
              <p className="text-blue-700 mb-0 text-sm">
                Chúng tôi sẽ gửi mã OTP đến email của bạn để đặt lại mật khẩu.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendOTP}
              autoComplete="off"
            >
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  placeholder="Nhập địa chỉ email của bạn"
                  size="large"
                  prefix={<MailOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Gửi mã OTP
                </Button>
              </Form.Item>

              <Form.Item className="mb-0">
                <Button
                  type="default"
                  onClick={handleClose}
                  size="large"
                  block
                  className="mt-2"
                >
                  Hủy
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 1:
        return (
          <>
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 mb-2">
                <strong>Nhập mã OTP từ email</strong>
              </p>
              <p className="text-orange-700 mb-1 text-sm">
                Mã OTP đã được gửi đến: <strong>{email}</strong>
              </p>
              <p className="text-orange-600 mb-1 text-xs">
                Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam). Sau khi nhập OTP, bạn sẽ có thể đặt mật khẩu mới.
              </p>
              {resendCooldown > 0 && (
                <p className="text-blue-600 mb-0 text-xs font-medium">
                  💡 Có thể gửi lại OTP sau {resendCooldown} giây
                </p>
              )}
            </div>

            <Form
              form={otpForm}
              layout="vertical"
              onFinish={handleVerifyOTP}
              autoComplete="off"
            >
              <Form.Item
                label="Mã OTP"
                name="otp"
                rules={[
                  { required: true, message: "Vui lòng nhập mã OTP!" },
                  { len: 6, message: "Mã OTP phải có 6 số!" },
                ]}
              >
                <Input
                  placeholder="Nhập mã OTP 6 số"
                  size="large"
                  maxLength={6}
                  prefix={<SafetyOutlined className="text-gray-400" />}
                  style={{ letterSpacing: '0.1em', textAlign: 'center' }}
                />
              </Form.Item>

              <Form.Item className="mb-2">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Tiếp tục
                </Button>
              </Form.Item>

              <div className="flex gap-2">
                <Button
                  type="default"
                  onClick={handleBackToEmail}
                  size="large"
                  className="flex-1"
                >
                  Quay lại
                </Button>
                <Button
                  type="default"
                  onClick={handleResendOTP}
                  loading={loading}
                  disabled={resendCooldown > 0}
                  size="large"
                  className="flex-1"
                >
                  {resendCooldown > 0 ? `Chờ ${resendCooldown}s` : "Gửi lại OTP"}
                </Button>
              </div>
            </Form>
          </>
        );

      case 2:
        return (
          <>
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 mb-2">
                <strong>Đặt mật khẩu mới</strong>
              </p>
              <p className="text-green-700 mb-0 text-sm">
                Nhập mật khẩu mới cho tài khoản của bạn.
              </p>
            </div>

            <Form
              form={resetForm}
              layout="vertical"
              onFinish={handleResetPassword}
              autoComplete="off"
            >
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
                  Đặt lại mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </>
        );

      case 3:
        return (
          <Result
            icon={<CheckCircleOutlined className="text-green-500" />}
            title="Đặt lại mật khẩu thành công!"
            subTitle={
              <div className="text-center">
                <p className="mb-2">
                  Mật khẩu của bạn đã được đặt lại thành công.
                </p>
                <p className="text-gray-600 text-sm mb-2">
                  Bạn có thể đăng nhập ngay bằng mật khẩu mới.
                </p>
                <p className="text-green-600 text-sm font-medium">
                  ✓ Hệ thống sẽ tự động bỏ qua yêu cầu đổi mật khẩu cho lần đăng nhập tiếp theo
                </p>
              </div>
            }
            extra={[
              <Button 
                key="login" 
                type="primary" 
                onClick={handleClose}
                size="large"
                className="bg-green-500 hover:bg-green-600 mr-2"
              >
                Đăng nhập ngay
              </Button>,
              <Button 
                key="close" 
                type="default" 
                onClick={handleClose}
                size="large"
              >
                Đóng
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      title={
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MailOutlined className="text-blue-500" />
            <span>Khôi phục mật khẩu</span>
          </div>
          <Steps current={currentStep} size="small">
            <Step title="Email" icon={<MailOutlined />} />
            <Step title="OTP" icon={<SafetyOutlined />} />
            <Step title="Mật khẩu mới" icon={<LockOutlined />} />
          </Steps>
        </div>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={550}
      centered
    >
      {renderStepContent()}
    </Modal>
  );
};

export default ForgotPasswordModal;