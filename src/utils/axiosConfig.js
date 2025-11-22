// src/utils/axiosConfig.js
import axios from "axios";

const getBaseURL = () => {
  // Production: domain gốc, KHÔNG có /api
  if (import.meta.env.PROD) {
    return "https://swp391-be-y3kc.onrender.com";
  }

  // Development: domain local, KHÔNG có /api
  return "http://localhost:8080";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

// Add token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 401 → logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
