import axios from "axios";

// Cấu hình baseURL dựa trên môi trường
// Development: dùng proxy Vite '/api/' để tránh CORS
// Production: dùng trực tiếp URL Backend từ biến môi trường
const getBaseURL = () => {
  // Nếu có biến môi trường VITE_API_BASE_URL, dùng nó
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Nếu đang ở production (đã deploy), dùng URL Backend thật
  if (import.meta.env.PROD) {
    return "https://swp391-be-y3kc.onrender.com";
  }
  
  // Development: dùng proxy '/api/'
  return "/api/";
};

const baseURL = getBaseURL();

// Set config defaults when creating the instance
const api = axios.create({
  baseURL,
});

// Request interceptor để thêm token vào mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Chỉ redirect về login khi thực sự cần (không phải khi backend chưa sẵn sàng)
    if (error.response?.status === 401) {
      // 401: Unauthorized - token không hợp lệ hoặc hết hạn

      // Thử refresh token nếu có refreshToken
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Sử dụng baseURL động cho refresh token endpoint
          const refreshResponse = await axios.post(
            `${baseURL}/auth/refresh`,
            {
              refreshToken: refreshToken,
            }
          );

          if (refreshResponse.data.success) {
            const { token } = refreshResponse.data.data;
            localStorage.setItem("token", token);

            // Retry original request với token mới
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
        }
      }

      // Nếu refresh token thất bại hoặc không có refreshToken, xóa tất cả và redirect
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }

    // 403: Forbidden - có thể do backend chưa sẵn sàng, không redirect
    return Promise.reject(error);
  }
);

export default api;