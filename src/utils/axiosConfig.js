// src/utils/axiosConfig.js
import axios from "axios";

const getBaseURL = () => {
  // Production (deploy) → dùng backend thật
  if (import.meta.env.PROD) {
    return "https://swp391-be-y3kc.onrender.com";
  }

  // Development (local) → dùng local backend
  return "http://localhost:8080";
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
