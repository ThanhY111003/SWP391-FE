// src/utils/axiosConfig.js
import axios from "axios";

// Cấu hình baseURL dựa trên môi trường
const getBaseURL = () => {
  // Nếu có biến môi trường VITE_API_BASE_URL, dùng nó
  if (import.meta.env.VITE_API_BASE_URL) {
    console.log("Using VITE_API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Nếu đang ở production (đã deploy), dùng URL Backend thật
  if (import.meta.env.PROD) {
    console.log("Production mode - using hardcoded URL");
    return "https://swp391-be-y3kc.onrender.com/api";
  }
  
  // Development: dùng proxy Vite
  console.log("Development mode - using proxy");
  return "/api";
};

const baseURL = getBaseURL();
console.log("✅ axiosConfig baseURL:", baseURL);

// Create axios instance
const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug log
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });

    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log("🚪 Token invalid - Redirecting to login...");
      localStorage.clear();
      
      // Chỉ redirect nếu không đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;