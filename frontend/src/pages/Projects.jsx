import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { projectsAPI } from '../api/client';
import { IconPlus, IconClose, IconProject, IconTrash } from '../components/icons/SvgIcons';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showCreate || showConfirm) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [showCreate, showConfirm]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
  const load = async () => { try { const r = await projectsAPI.list(); setProjects(r.data); } catch {} };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await projectsAPI.create(form); setShowCreate(false); setForm({ name: '', description: '' }); showToast('Project created!'); load(); }
    catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!showConfirm) return;
    try { await projectsAPI.delete(showConfirm.id); setShowConfirm(null); showToast('Project deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <div>
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.message}</div></div>}

      <div className="page-header">
        <div><h1 className="page-title">Projects</h1><p className="page-subtitle">{projects.length} projects</p></div>
        {user?.role === 'Admin' && <button className="btn btn-primary" onClick={() => setShowCreate(true)}><IconPlus /> New Project</button>}
      </div>

      <div className="projects-grid">
        {projects.map((p, i) => (
          <div className="card animate-fade" key={p.id} style={{ animationDelay: `${i * 50}ms` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconProject style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div className="project-card-name">{p.name}</div>
              </div>
              {user?.role === 'Admin' && (
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowConfirm({ id: p.id, name: p.name })} style={{ color: 'var(--danger)' }}>
                  <IconTrash style={{ width: 14, height: 14 }} />
                </button>
              )}
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
              <div className="input-group"><label>Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
              <div className="input-group"><label>Description</label><textarea className="input-field" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(null)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconTrash style={{ width: 22, height: 22, color: 'var(--danger)' }} />
            </div>
            <h4>Delete "{showConfirm.name}"?</h4>
            <p>All tasks in this project will also be deleted. This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Project</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
