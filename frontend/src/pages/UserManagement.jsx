import React, { useState, useEffect } from 'react';
import { usersAPI, teamsAPI } from '../api/client';
import { IconClose, IconTrash, IconEdit } from '../components/icons/SvgIcons';

const ROLES = ['Admin', 'QL', 'Member'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showEdit, setShowEdit] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (showEdit || showConfirm) document.body.classList.add('modal-open');
    else document.body.classList.remove('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [showEdit, showConfirm]);

  const showToast = (msg, type = 'success') => { setToast({ message: msg, type }); setTimeout(() => setToast(null), 3000); };
  const load = async () => { try { const [u, t] = await Promise.all([usersAPI.list(), teamsAPI.list()]); setUsers(u.data); setTeams(t.data); } catch {} };
  const openEdit = (u) => { setShowEdit(u); setEditForm({ full_name: u.full_name, role: u.role, team_id: u.team_id || '', is_active: u.is_active }); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...editForm, team_id: editForm.team_id ? Number(editForm.team_id) : null };
      await usersAPI.update(showEdit.id, data);
      setShowEdit(null); showToast('User updated'); load();
    } catch (err) { showToast(err.response?.data?.detail || 'Update failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!showConfirm) return;
    try { await usersAPI.delete(showConfirm.id); setShowConfirm(null); showToast('User deleted'); load(); }
    catch { showToast('Failed to delete user', 'error'); }
  };

  const roleCls = { Admin: 'badge-admin', QL: 'badge-ql', Member: 'badge-member' };

  return (
    <div>
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.message}</div></div>}

      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">{users.length} registered users</p></div>
      </div>

      <div className="card">
        <table className="data-table">
          <thead><tr><th>User</th><th>Role</th><th>Team</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => {
              const team = teams.find(t => t.id === u.team_id);
              return (
                <tr key={u.id}>
                  <td><div style={{ fontWeight: 500 }}>{u.full_name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{u.email}</div></td>
                  <td><span className={`badge ${roleCls[u.role]}`}>{u.role}</span></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{team?.name || '—'}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-completed' : 'badge-backlog'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)} title="Edit"><IconEdit style={{ width: 14, height: 14 }} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setShowConfirm({ id: u.id, name: u.full_name })} style={{ color: 'var(--danger)' }} title="Delete"><IconTrash style={{ width: 14, height: 14 }} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showEdit && (
        <div className="modal-overlay" onClick={() => setShowEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 className="modal-title">Edit User</h3><button className="btn btn-ghost btn-icon" onClick={() => setShowEdit(null)}><IconClose /></button></div>
            <form onSubmit={handleUpdate}>
              <div className="input-group"><label>Full Name</label><input className="input-field" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="input-group"><label>Role</label>
                  <select className="input-field" value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="input-group"><label>Team</label>
                  <select className="input-field" value={editForm.team_id} onChange={e => setEditForm({ ...editForm, team_id: e.target.value })}>
                    <option value="">No Team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-group"><label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({ ...editForm, is_active: e.target.checked })} style={{ width: 16, height: 16 }} /> Active
              </label></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowEdit(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
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
            <p>Their tasks will be unassigned. This cannot be undone.</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
