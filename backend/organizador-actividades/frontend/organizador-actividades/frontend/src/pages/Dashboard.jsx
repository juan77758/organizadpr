import React from 'react';
import Navbar from '../components/Layout/Navbar';
import KanbanBoard from '../components/Board/KanbanBoard';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Navbar />
      <main className="main-content">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Dashboard;
