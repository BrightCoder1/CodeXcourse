import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DetailsOverview from '../components/DetailsOverview';
import StudentGrowth from '../components/StudentGrowth';
import RecentStudent from '../components/RecentStudent';
import AttendanceDashboard from '../components/AttendanceDashboard';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <DashboardHeader
                title="Dashboard Overview"
            />

            <DetailsOverview />
            <AttendanceDashboard />
            {/* <Registration /> */}
            <StudentGrowth />
            <RecentStudent />
        </div>
    );
};

export default Dashboard;