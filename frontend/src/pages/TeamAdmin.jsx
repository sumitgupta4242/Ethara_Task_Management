import React, { useState, useEffect } from 'react';
import { teamsAPI, usersAPI } from '../api/client';
import { IconPlus, IconClose, IconTrash, IconTeam } from '../components/icons/SvgIcons';

export default function TeamAdmin() {
  const [teams, setTeams] = useState([]);
  const [qls, setQls] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({ name: '', ql_id: '' });

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showCreate || showConfirm) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [showCreate, showConfirm]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
  const load = async () => { try { const [t, u] = await Promise.all([teamsAPI.list(), usersAPI.list()]); setTeams(t.data); setQls(u.data.filter(u => u.role === 'QL')); } catch {} };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { name: form.name };
      if (form.ql_id) data.ql_id = Number(form.ql_id);
      await teamsAPI.create(data);
      setShowCreate(false); setForm({ name: '', ql_id: '' }); showToast('Team created!'); load();
    } catch (err) { showToast(err.response?.data?.detail || 'Failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!showConfirm) return;
    try { await teamsAPI.delete(showConfirm.id); setShowConfirm(null); showToast('Team deleted'); load(); }
    catch { showToast('Failed to delete', 'error'); }
  };

  return (
    <div>
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.message}</div></div>}

      <div className="page-header">
        <div><h1 className="page-title">Team Management</h1><p className="page-subtitle">{teams.length} teams</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><IconPlus /> New Team</button>
      </div>

      <div className="projects-grid">
        {teams.map((t, i) => {
          const ql = qls.find(q => q.id === t.ql_id);
          return (
            <div className="card animate-fade" key={t.id} style={{ animationDelay: `${i * 50}ms` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <IconTeam style={{ width: 18, height: 18, color: 'white' }} />
                  </div>
                  <div><div style={{ fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>QL: {ql?.full_name || 'Unassigned'}</div></div>
                </div>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowConfirm({ id: t.id, name: t.name })} style={{ color: 'var(--danger)' }}><IconTrash style={{ width: 14, height: 14 }} /></button>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length === 0 && <div className="card"><div className="empty-state"><IconTeam style={{ width: 48, height: 48 }} /><p>No teams yet</p></div></div>}

      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 className="modal-title">Create Team</h3><button className="btn btn-ghost btn-icon" onClick={() => setShowCreate(false)}><IconClose /></button></div>
            <form onSubmit={handleCreate}>
              <div className="input-group"><label>Team Name *</label><input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus /></div>
              <div className="input-group"><label>Quality Lead (QL)</label>
                <select className="input-field" value={form.ql_id} onChange={e => setForm({ ...form, ql_id: e.target.value })}>
                  <option value="">No QL assigned</option>{qls.map(q => <option key={q.id} value={q.id}>{q.full_name}</option>)}
                </select>
              </div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Team</button></div>
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
            <p>Members will be unassigned from this team.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Team</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
