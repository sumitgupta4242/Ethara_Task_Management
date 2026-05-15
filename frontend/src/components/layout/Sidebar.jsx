import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconDashboard, IconTasks, IconProject, IconUsers, IconTeam, IconLogout } from '../icons/SvgIcons';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';

  const navItems = [
    { to: '/', icon: <IconDashboard />, label: 'Dashboard', roles: ['Admin', 'QL', 'Member'] },
    { to: '/tasks', icon: <IconTasks />, label: 'Tasks', roles: ['Admin', 'QL', 'Member'] },
    { to: '/projects', icon: <IconProject />, label: 'Projects', roles: ['Admin', 'QL', 'Member'] },
  ];

  const mgmtItems = [
    { to: '/team', icon: <IconTeam />, label: 'My Team', roles: ['QL'] },
    { to: '/users', icon: <IconUsers />, label: 'User Management', roles: ['Admin'] },
    { to: '/teams', icon: <IconTeam />, label: 'Team Management', roles: ['Admin'] },
  ];

  const filteredMgmt = mgmtItems.filter(i => i.roles.includes(user?.role));

  return (
    <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <span className="sidebar-logo-text">Ethara</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Main</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              {item.icon}<span>{item.label}</span>
            </NavLink>
          ))}
        </div>
        {filteredMgmt.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Management</div>
            {filteredMgmt.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`} onClick={onClose}>
                {item.icon}<span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.full_name}</div>
            <div className="sidebar-user-role">{user?.role}</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout"><IconLogout /></button>
        </div>
      </div>
    </aside>
  );
}
