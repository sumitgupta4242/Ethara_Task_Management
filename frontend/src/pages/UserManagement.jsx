import React, { useState, useEffect } from 'react';
import { usersAPI, teamsAPI } from '../api/client';
import { IconPlus, IconClose, IconTrash, IconEdit } from '../components/icons/SvgIcons';

const ROLES = ['Admin', 'QL', 'Member'];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showEdit, setShowEdit] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => { load(); }, []);
  const load = async () => {
    try {
      const [u, t] = await Promise.all([usersAPI.list(), teamsAPI.list()]);
      setUsers(u.data); setTeams(t.data);
    } catch {}
  };

  const openEdit = (u) => { setShowEdit(u); setEditForm({ full_name: u.full_name, role: u.role, team_id: u.team_id || '', is_active: u.is_active }); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...editForm, team_id: editForm.team_id ? Number(editForm.team_id) : null };
      await usersAPI.update(showEdit.id, data);
      setShowEdit(null); load();
    } catch (err) { alert(err.response?.data?.detail || 'Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? Their tasks will be unassigned.')) return;
    try { await usersAPI.delete(id); load(); } catch {}
  };

  const roleCls = { Admin: 'badge-admin', QL: 'badge-ql', Member: 'badge-member' };

  return (
    <div>
      <div className="page-header">
        <div><h1 className="page-title">User Management</h1><p className="page-subtitle">{users.length} users</p></div>
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
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(u)}><IconEdit style={{ width: 14, height: 14 }} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(u.id)} style={{ color: 'var(--danger)' }}><IconTrash style={{ width: 14, height: 14 }} /></button>
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
              <div className="input-group"><label>Full Name</label><input className="input-field" value={editForm.full_name} onChange={e => setEditForm({...editForm, full_name: e.target.value})} required /></div>
              <div className="input-group"><label>Role</label>
                <select className="input-field" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="input-group"><label>Team</label>
                <select className="input-field" value={editForm.team_id} onChange={e => setEditForm({...editForm, team_id: e.target.value})}>
                  <option value="">No Team</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="input-group"><label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={editForm.is_active} onChange={e => setEditForm({...editForm, is_active: e.target.checked})} /> Active
              </label></div>
              <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setShowEdit(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
