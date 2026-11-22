import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import StudentDashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MyCourse from './pages/MyCourse';
import CourseList from './pages/CourseList';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import './App.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const LOGIN_URL = import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173/login';

function AppLayout() {
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('student-theme') === 'dark',
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [student, setStudent] = useState(null);
  const [authStatus, setAuthStatus] = useState('loading');
  const [authError, setAuthError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    localStorage.setItem('student-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    let isCurrent = true;

    const loadStudent = async () => {
      try {
        const response = await fetch(`${API_URL}/student/profile`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          window.location.assign(LOGIN_URL);
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || 'Unable to verify your student session.');
        }
        if (isCurrent) {
          setStudent(data.student);
          setAuthStatus('authenticated');
        }
      } catch (error) {
        if (isCurrent) {
          setAuthStatus('error');
          setAuthError(error.message || 'Unable to connect to the authentication service.');
        }
      }
    };

    loadStudent();
    return () => {
      isCurrent = false;
    };
  }, [retryCount]);

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/student/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.assign(LOGIN_URL);
          return;
        }
        throw new Error(data.message || 'Unable to log out.');
      }
      window.location.assign(LOGIN_URL);
    } catch (error) {
      window.alert(error.message || 'Unable to log out. Please try again.');
    }
  };

  if (authStatus === 'loading') {
    return <main className="content-area" role="status">Verifying student session...</main>;
  }

  if (authStatus === 'error') {
    return (
      <main className="content-area">
        <p role="alert">{authError}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
          Try again
        </button>
      </main>
    );
  }

  return (
    <div className="app-container" data-theme={isDarkMode ? 'dark' : 'light'}>
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        onLogout={handleLogout}
      />

      <div className="main-wrapper">
        <TopNavbar
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((darkMode) => !darkMode)}
          student={student}
        />

        <main className="content-area">
          <Routes>
            <Route path="/" element={<StudentDashboard student={student} />} />
            <Route
              path="/profile"
              element={<Profile student={student} onStudentUpdated={setStudent} />}
            />
            <Route path="/mycourse" element={<MyCourse student={student} />} />
            <Route path="/courselist" element={<CourseList />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees student={student} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
