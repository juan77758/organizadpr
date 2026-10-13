import React from 'react';
import Navbar from '../components/Layout/Navbar';
import KanbanBoard from '../components/Board/KanbanBoard';
import TestNotifications from '../components/common/TestNotifications';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="main-content">
        <KanbanBoard />
      </main>
      {import.meta.env.DEV && <TestNotifications />}
    </div>
  );
};

export default Dashboard;
