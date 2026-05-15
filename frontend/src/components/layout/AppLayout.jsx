import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/projects': 'Projects',
  '/team': 'My Team',
  '/users': 'User Management',
  '/teams': 'Team Management',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Ethara';

  return (
    <div className="app-layout">
      {/* Mobile sidebar backdrop */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <Topbar title={title} onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="app-content animate-fade" key={location.pathname}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
