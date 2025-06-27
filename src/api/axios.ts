// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD
    ? "https://health-care-zeta-henna.vercel.app/api" // لينك الباك اند على Vercel
    : "/api", // هيفعل البروكسي وقت التطوير
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
