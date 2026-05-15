import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { teamsAPI, tasksAPI } from '../api/client';
import { IconUsers } from '../components/icons/SvgIcons';

export default function TeamManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teamName, setTeamName] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    if (!user?.team_id) return;
    try {
      const [team, t] = await Promise.all([teamsAPI.get(user.team_id), tasksAPI.list()]);
      setTeamName(team.data.name);
      setMembers(team.data.members || []);
      setTasks(t.data);
    } catch {}
  };

  const getTasksForMember = (memberId) => tasks.filter(t => t.assigned_to === memberId);
  const statusCls = { 'Backlog': 'badge-backlog', 'Assigned': 'badge-assigned', 'In Progress': 'badge-inprogress', 'Ready for Review': 'badge-review', 'Completed': 'badge-completed' };

  if (!user?.team_id) return <div className="card"><div className="empty-state"><IconUsers style={{ width: 48, height: 48 }} /><p>You are not assigned to a team yet.</p></div></div>;

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">{teamName}</h1><p className="page-subtitle">{members.length} team members</p></div>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        {members.map((m, i) => {
          const mTasks = getTasksForMember(m.id);
          const initials = m.full_name.split(' ').map(n => n[0]).join('').slice(0, 2);
          return (
            <div className="card animate-fade" key={m.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="sidebar-avatar">{initials}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{m.full_name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{m.email} · <span className={`badge badge-${m.role.toLowerCase()}`}>{m.role}</span></div>
                </div>
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{mTasks.length}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>tasks</div>
                </div>
              </div>
              {mTasks.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {mTasks.map(t => (
                    <span key={t.id} className={`badge ${statusCls[t.status]}`} style={{ fontSize: '0.7rem' }} title={t.title}>{t.title.slice(0, 20)}{t.title.length > 20 ? '...' : ''}</span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
