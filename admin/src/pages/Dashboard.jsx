import React from 'react';
import DashboardHeader from '../components/DashboardHeader';
import DetailsOverview from '../components/DetailsOverview';
import StudentGrowth from '../components/StudentGrowth';
import RecentStudent from '../components/RecentStudent';
import Registration from '../components/Registration';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <DashboardHeader
                title="Dashboard Overview"
            />

            <DetailsOverview />
            <Registration />
            <StudentGrowth />
            <RecentStudent />
        </div>
    );
};

export default Dashboard;