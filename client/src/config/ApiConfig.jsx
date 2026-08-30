import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4500",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired or invalid cookie token
      if (sessionStorage.getItem("cravingUser")) {
        sessionStorage.removeItem("cravingUser");
      }
    }
    return Promise.reject(error);
  }
);

export default api;