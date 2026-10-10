import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css'; // or your global stylesheet
import TopNavbar from './components/Topnavbar';
import Dashboard from './pages/Dashboard';
import Course from './pages/Course';
import Student from './pages/Student';
import Analytics from './pages/Analytics';
import Finance from './pages/Finance';
import Setting from './pages/Setting';

export default function App() {
  return (
    <Router>
      <div className="dashboard_body">
        <Navbar />

        <div className="dashboard_main_wrapper">
          <TopNavbar />

          <main className="dashboard_content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path='/courses' element={<Course />} />
              <Route path='/students' element={<Student /> }/>
              <Route path='/analytics' element={<Analytics /> }/>
              <Route path='/finances' element={<Finance /> }/>
              <Route path='/settings' element={<Setting /> }/>

            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
