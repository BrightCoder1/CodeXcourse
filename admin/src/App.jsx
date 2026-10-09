import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css'; // or your global stylesheet
import TopNavbar from './components/Topnavbar';

export default function App() {
  return (
    <Router>
      <div className="dashboard_body">
        <Navbar />

        <div className="dashboard_main_wrapper">
          <TopNavbar />

          <main className="dashboard_content">
            <Routes>
              {/* <Route path="/" element={<DashboardView />} /> */}
              
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}
