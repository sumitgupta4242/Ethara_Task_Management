import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { tasksAPI, projectsAPI, teamsAPI } from '../api/client';
import { IconPlus, IconClose } from '../components/icons/SvgIcons';

const STATUSES = ['Backlog', 'Assigned', 'In Progress', 'Ready for Review', 'Completed'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const statusCls = { 'Backlog': 'badge-backlog', 'Assigned': 'badge-assigned', 'In Progress': 'badge-inprogress', 'Ready for Review': 'badge-review', 'Completed': 'badge-completed' };
const priorityCls = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high', Critical: 'badge-critical' };

export default function TasksView() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'Medium', project_id: '', assigned_to: '' });

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [t, p] = await Promise.all([tasksAPI.list(), projectsAPI.list()]);
      setTasks(t.data); setProjects(p.data);
      if (user.role === 'QL' && user.team_id) {
        try { const m = await teamsAPI.getMembers(user.team_id); setMembers(m.data); } catch {}
      }
      if (user.role === 'Admin') {
        try {
          const { usersAPI } = await import('../api/client');
          const u = await usersAPI.list(); setMembers(u.data.filter(u => u.role === 'Member'));
        } catch {}
      }
    } catch {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form, project_id: Number(form.project_id) };
      if (form.assigned_to) data.assigned_to = Number(form.assigned_to);
      else delete data.assigned_to;
      await tasksAPI.create(data);
      setShowCreate(false); setForm({ title: '', description: '', priority: 'Medium', project_id: '', assigned_to: '' });
      loadAll();
    } catch {}
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try { await tasksAPI.updateStatus(taskId, { status: newStatus }); loadAll(); } catch (e) { alert(e.response?.data?.detail || 'Cannot change status'); }
  };

  const handleAssign = async (taskId, memberId) => {
    try { await tasksAPI.assign(taskId, { assigned_to: Number(memberId) }); loadAll(); } catch (e) { alert(e.response?.data?.detail || 'Cannot assign'); }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try { await tasksAPI.delete(taskId); setShowDetail(null); loadAll(); } catch {}
  };

  const canCreate = ['Admin', 'QL'].includes(user?.role);
  const canModify = ['Admin', 'QL'].includes(user?.role);

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Tasks</h1><p className="page-subtitle">Manage and track all tasks</p></div>
        {canCreate && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><IconPlus /> New Task</button>}
      </div>

      <div className="kanban">
        {STATUSES.map(status => {
          const colTasks = tasks.filter(t => t.status === status);
          return (
            <div className="kanban-column" key={status}>
              <div className="kanban-header">
                <span className={`kanban-title`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className={`badge ${statusCls[status]}`} style={{ width: 8, height: 8, padding: 0, borderRadius: '50%' }}></span> {status}
                </span>
                <span className="kanban-count">{colTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {colTasks.map(task => (
                  <div className="task-card" key={task.id} onClick={() => setShowDetail(task)}>
                    <div className="task-card-title">{task.title}</div>
                    <div className="task-card-meta">
                      <span className={`badge ${priorityCls[task.priority]}`}>{task.priority}</span>
                    </div>
                    {task.assignee && (
                      <div className="task-card-assignee">
                        <div className="task-card-avatar">{task.assignee.full_name.split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                        {task.assignee.full_name}
                      </div>
                    )}
                  </div>
                ))}
                {colTasks.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="modal-title">Create Task</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><IconClose /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="input-group"><label>Title</label><input className="input-field" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required /></div>
              <div className="input-group"><label>Description</label><textarea className="input-field" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div>
              <div className="input-group"><label>Project</label>
                <select className="input-field" value={form.project_id} onChange={e=>setForm({...form,project_id:e.target.value})} required>
                  <option value="">Select project</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Priority</label>
                <select className="input-field" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>
                  {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {members.length > 0 && (
                <div className="input-group"><label>Assign To</label>
                  <select className="input-field" value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})}>
                    <option value="">Unassigned (Backlog)</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={()=>setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Task</button></div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ margin: 0 }}>{showDetail.title}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowDetail(null)}><IconClose /></button>
            </div>
            {showDetail.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16 }}>{showDetail.description}</p>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className={`badge ${statusCls[showDetail.status]}`}>{showDetail.status}</span>
              <span className={`badge ${priorityCls[showDetail.priority]}`}>{showDetail.priority}</span>
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>Assignee: <strong>{showDetail.assignee?.full_name || 'Unassigned'}</strong></div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Created by: <strong>{showDetail.creator?.full_name || '—'}</strong></div>

            {canModify && (
              <>
                <div className="input-group"><label>Change Status</label>
                  <select className="input-field" value={showDetail.status} onChange={e => handleStatusChange(showDetail.id, e.target.value)}>
                    {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {members.length > 0 && (
                  <div className="input-group"><label>Reassign To</label>
                    <select className="input-field" value={showDetail.assigned_to || ''} onChange={e => handleAssign(showDetail.id, e.target.value)}>
                      <option value="">Unassigned</option>{members.map(m=><option key={m.id} value={m.id}>{m.full_name}</option>)}
                    </select>
                  </div>
                )}
              </>
            )}
            {!canModify && user?.role === 'Member' && (
              <div className="input-group"><label>Update Status</label>
                <select className="input-field" value={showDetail.status} onChange={e => handleStatusChange(showDetail.id, e.target.value)}>
                  {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}
            {canModify && (
              <div className="modal-actions"><button className="btn btn-danger btn-sm" onClick={() => handleDelete(showDetail.id)}>Delete Task</button></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
