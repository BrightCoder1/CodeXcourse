import { useState } from 'react';
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

function AppLayout() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="app-container" data-theme={isDarkMode ? 'dark' : 'light'}>
      <Sidebar
        collapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
      />

      <div className="main-wrapper">
        <TopNavbar
          isDarkMode={isDarkMode}
          onToggleTheme={() => setIsDarkMode((darkMode) => !darkMode)}
        />

        <main className="content-area">
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mycourse" element={<MyCourse />} />
            <Route path="/courselist" element={<CourseList />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/fees" element={<Fees />} />
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
