import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api/attendance",
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
  saveTeacherAttendance: (courseId, payload) =>
    sendMutation(API.post(`/teacher/courses/${courseId}`, payload)),
  getTeacherHistory: (params) => getData("/teacher/history", params),
  startSession: (courseId, durationMinutes) =>
    sendMutation(API.post(`/teacher/courses/${courseId}/session`, { durationMinutes })),
  closeSession: (sessionId) =>
    sendMutation(API.patch(`/teacher/sessions/${sessionId}/close`)),
  markSessionAbsentees: (sessionId) =>
    sendMutation(API.post(`/teacher/sessions/${sessionId}/mark-absent`)),
  getAdminAssignments: () => getData("/admin/assignments"),
  saveAssignments: (payload) =>
    sendMutation(API.put("/admin/assignments", payload)),
  getStudentAttendance: (params) => getData("/admin/students", params),
  getEmployeeAttendance: (params) => getData("/admin/employees", params),
  saveEmployeeAttendance: (employeeId, payload) =>
    sendMutation(API.put(`/admin/employees/${employeeId}`, payload)),
};

export default attendanceServices;
