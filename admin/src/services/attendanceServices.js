import axios from "axios";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
const API = axios.create({
  baseURL: `${API_BASE_URL}/attendance`,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getData = async (url, params) => {
  try {
    const response = await API.get(url, { params });
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Attendance request failed.");
    }
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Attendance request failed.");
  }
};

const sendMutation = async (request) => {
  try {
    const response = await request;
    if (!response.data?.success) {
      throw new Error(response.data?.message || "Unable to save attendance.");
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || "Unable to save attendance.");
  }
};

const attendanceServices = {
  getSummary: () => getData("/admin/summary"),
  getTeacherCourses: () => getData("/teacher/courses"),
  getTeacherStudents: async (courseId, date) => {
    try {
      const response = await API.get(`/teacher/courses/${courseId}/students`, { params: { date } });
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Unable to load class roster.");
      }
      return { students: response.data.data, session: response.data.session };
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || "Unable to load class roster.");
    }
  },
  getTeacherHistory: (params) => getData("/teacher/history", params),
  startSession: (courseId, durationMinutes) =>
    sendMutation(API.post(`/teacher/courses/${courseId}/session`, { durationMinutes })),
  closeSession: (sessionId) =>
    sendMutation(API.patch(`/teacher/sessions/${sessionId}/close`)),
  getAdminAssignments: () => getData("/admin/assignments"),
  saveAssignments: (payload) =>
    sendMutation(API.put("/admin/assignments", payload)),
  getCourseStudents: (courseId) => getData(`/admin/courses/${encodeURIComponent(courseId)}/students`),
  saveCourseStudents: (courseId, payload) =>
    sendMutation(API.put(`/admin/courses/${encodeURIComponent(courseId)}/students`, payload)),
  getStudentAttendance: (params) => getData("/admin/students", params),
  saveStudentAttendance: (attendanceId, payload) =>
    sendMutation(API.put(`/admin/students/${attendanceId}`, payload)),
  getEmployeeAttendance: (params) => getData("/admin/employees", params),
  saveEmployeeAttendance: (employeeId, payload) =>
    sendMutation(API.put(`/admin/employees/${employeeId}`, payload)),
};

export default attendanceServices;
