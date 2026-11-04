import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

const pendingGetRequests = new Map();

const getOnce = (url) => {
  const pendingRequest = pendingGetRequests.get(url);
  if (pendingRequest) return pendingRequest;

  const request = API.get(url).then(
    (response) => {
      pendingGetRequests.delete(url);
      return response;
    },
    (error) => {
      pendingGetRequests.delete(url);
      throw error;
    }
  );

  pendingGetRequests.set(url, request);
  return request;
};

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

    const response = await getOnce("/profile");
    const user = response.data.user || response.data;
    if (user.emp_role !== "admin") {
      localStorage.removeItem("admin_token");
      throw new Error("This account does not have administrator access.");
    }
    return user;
  },

  updateProfile: async (profileData) => {
    const response = await API.put("/update", profileData);
    return response.data.user;
  },

  getStudentCount: async () => {
    const response = await getOnce("/student/count");
    if (!Number.isInteger(response.data.count)) {
      throw new Error("The server returned an invalid student count.");
    }
    return response.data.count;
  },

  getAllStudents: async () => {
    const response = await getOnce("/student");
    if (!Array.isArray(response.data.data)) {
      throw new Error("The server returned an invalid students response.");
    }
    return response.data.data;
  },

  submitStudentFee: async (studentId, payment) => {
    const response = await API.post(`/student/${studentId}/fee-payments`, payment);
    if (!response.data.success || !response.data.data?._id) {
      throw new Error(response.data.message || "The server returned an invalid payment response.");
    }
    return response.data.data;
  },

  getRecentStudents: async () => {
    const response = await getOnce("/student/recent");
    if (!Array.isArray(response.data.data)) {
      throw new Error("The server returned an invalid recent-students response.");
    }
    return response.data.data;
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