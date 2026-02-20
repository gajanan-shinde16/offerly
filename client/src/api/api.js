import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true // 🔥 REQUIRED for HttpOnly cookies
});

export default api;
