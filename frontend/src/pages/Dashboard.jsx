import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI, usersAPI } from '../api/client';
import { IconTasks, IconProject, IconUsers, IconCheck, IconClock } from '../components/icons/SvgIcons';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ tasks: 0, projects: 0, users: 0, completed: 0, inProgress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([tasksAPI.list(), projectsAPI.list()]);
      const tasks = tasksRes.data;
      const s = {
        tasks: tasks.length,
        projects: projectsRes.data.length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        users: 0,
      };
      if (user.role === 'Admin') {
        try { const u = await usersAPI.list(); s.users = u.data.length; } catch {}
      }
      setStats(s);
      setRecentTasks(tasks.slice(0, 5));
    } catch {}
  };

  const statusBadge = (status) => {
    const cls = { 'Backlog': 'badge-backlog', 'Assigned': 'badge-assigned', 'In Progress': 'badge-inprogress', 'Ready for Review': 'badge-review', 'Completed': 'badge-completed' };
    return <span className={`badge ${cls[status] || 'badge-backlog'}`}>{status}</span>;
  };

  const priorityBadge = (p) => {
    const cls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' };
    return <span className={`badge ${cls[p] || ''}`}>{p}</span>;
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{greeting()}, {user?.full_name?.split(' ')[0]}</h1><p className="page-subtitle">Here's what's happening with your tasks today</p></div>
      </div>

      <div className="stats-grid">
        {[
          { icon: <IconTasks />, bg: 'var(--info-bg)', color: 'var(--info)', value: stats.tasks, label: 'Total Tasks' },
          { icon: <IconClock />, bg: 'var(--warning-bg)', color: 'var(--warning)', value: stats.inProgress, label: 'In Progress' },
          { icon: <IconCheck />, bg: 'var(--success-bg)', color: 'var(--success)', value: stats.completed, label: 'Completed' },
          { icon: <IconProject />, bg: 'var(--info-bg)', color: 'var(--info)', value: stats.projects, label: 'Projects' },
          ...(user?.role === 'Admin' ? [{ icon: <IconUsers />, bg: 'var(--danger-bg)', color: 'var(--danger)', value: stats.users, label: 'Total Users' }] : []),
        ].map((s, i) => (
          <div className="card animate-fade" key={i} style={{ animationDelay: `${i * 60}ms` }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Recent Tasks</h3></div>
        {recentTasks.length === 0 ? (
          <div className="empty-state"><p>No tasks found</p></div>
        ) : (
          <table className="data-table">
            <thead><tr><th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th></tr></thead>
            <tbody>
              {recentTasks.map(t => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500 }}>{t.title}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>{priorityBadge(t.priority)}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{t.assignee?.full_name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
