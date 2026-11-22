import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import TopNavbar from "./components/TopNavbar";
import "./App.css";

import Dashboard from "./pages/Dashboard";
import Course from "./pages/Course";
import Student from "./pages/Student";
import Analytics from "./pages/Analytics";
import Finance from "./pages/Finance";
import Profile from "./pages/Profile";

import Employee from "./components/Employee";
import EmployeeAdd from "./components/EmployeeAdd";
import EmployeeEdit from "./components/EmployeeEdit";
import AdminLogin from "./pages/AdminLogin";

import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import StudentRegister from "./components/StudentRegister";
import Attendance from "./pages/Attendance";

function DashboardLayout() {
  return (
    <div className="dashboard_body">
      <Navbar />
      <div className="dashboard_main_wrapper">
        <TopNavbar />
        <main className="dashboard_content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function LoginRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center"
      }}>
        Checking staff session...
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={user?.emp_role === "employee" ? "/attendance" : "/"} replace />;
  }

  return <AdminLogin />;
}

function AdminOnly() {
  const { user } = useAuth();
  return user?.emp_role === "admin"
    ? <Outlet />
    : <Navigate to="/attendance" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/c/admin/login" element={<LoginRoute />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route element={<AdminOnly />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<Course />} />
            <Route path="/students" element={<Student />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/finances" element={<Finance />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/student/register" element={<StudentRegister />} />
            <Route path="/employees" element={<Employee />} />
            <Route path="/employees/add" element={<EmployeeAdd />} />
            <Route path="/employees/edit/:id" element={<EmployeeEdit />} />
          </Route>
          <Route path="/attendance" element={<Attendance />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/c/admin/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}