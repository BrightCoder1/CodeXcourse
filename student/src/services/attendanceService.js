const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
  .replace(/\/$/, '');

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}/attendance${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Attendance request failed.');
  }
  return data.data;
};

const queryString = (params) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : '';
};

const attendanceService = {
  getDashboard: () => request('/student'),
  getHistory: (filters) => request(`/student/history${queryString(filters)}`),
  markCoursePresent: (courseId) =>
    request(`/student/courses/${encodeURIComponent(courseId)}/mark`, { method: 'POST' }),
  markDailyPresent: () => request('/student/daily', { method: 'POST' }),
};

export default attendanceService;
