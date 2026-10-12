import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  login: async (email, password) => {
    const response = await API.post("/admin/login", { email, password });
    const { token } = response.data;

    if (!token) {
      throw new Error("Login succeeded without an authentication token.");
    }

    localStorage.setItem("admin_token", token);

    try {
      return await authService.checkAuth();
    } catch (error) {
      localStorage.removeItem("admin_token");
      throw error;
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      throw new Error("No token found");
    }

    const response = await API.get("/profile");
    const user = response.data.user || response.data;
    if (user.emp_role !== "admin") {
      localStorage.removeItem("admin_token");
      throw new Error("This account does not have administrator access.");
    }
    return user;
  },

  logout: async () => {
    try {
      await API.get("/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("admin_token");
    }
  },
};

export default authService;