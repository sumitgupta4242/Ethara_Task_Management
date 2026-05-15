import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/client';
import { IconPlus, IconClose, IconProject, IconTrash } from '../components/icons/SvgIcons';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { load(); }, []);
  const load = async () => { try { const r = await projectsAPI.list(); setProjects(r.data); } catch {} };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await projectsAPI.create(form); setShowCreate(false); setForm({ name: '', description: '' }); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectsAPI.delete(id); load(); } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">Projects</h1><p className="page-subtitle">{projects.length} projects</p></div>
        {user?.role === 'Admin' && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><IconPlus /> New Project</button>}
      </div>
      <div className="projects-grid">
        {projects.map((p, i) => (
          <div className="card animate-fade" key={p.id} style={{ animationDelay: `${i * 50}ms` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconProject style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div className="project-card-name">{p.name}</div>
              </div>
              {user?.role === 'Admin' && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(p.id)}><IconTrash style={{ width: 14, height: 14 }} /></button>}
            </div>
            <div className="project-card-desc">{p.description || 'No description'}</div>
            <div className="project-card-footer">
              <span>{p.task_count || 0} tasks</span>
              <span>by {p.creator?.full_name || 'Admin'}</span>
            </div>
          </div>
        ))}
      </div>
      {projects.length === 0 && <div className="card"><div className="empty-state"><IconProject style={{ width: 48, height: 48 }} /><p>No projects yet</p></div></div>}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 className="modal-title">Create Project</h3><button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><IconClose /></button></div>
            <form onSubmit={handleCreate}>
              <div className="input-group"><label>Name</label><input className="input-field" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
              <div className="input-group"><label>Description</label><textarea className="input-field" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
