import React, { useState, useEffect , useCallback } from 'react';
import { COLORS } from '../styles/theme';
import {
  adminGetUsers, adminCreateUser, adminChangeRole,
  adminDeactivateUser, adminActivateUser, adminGetDashboard
} from '../services/api';

const ROLES = ['REGISTRAR', 'DEALING_ASSISTANT'];

const badge = (role) => {
  const map = {
    SUPERUSER: { bg: COLORS.primary, color: '#fff' },
    REGISTRAR: { bg: COLORS.accent, color: '#fff' },
    DEALING_ASSISTANT: { bg: COLORS.success, color: '#fff' },
  };
  const s = map[role] || { bg: COLORS.lightGray, color: COLORS.text };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 4, fontSize: 11, padding: '2px 8px', fontWeight: 600 }}>
      {role.replace('_', ' ')}
    </span>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 10,
    padding: '18px 22px', flex: 1, minWidth: 130, textAlign: 'center',
    borderTop: `4px solid ${color || COLORS.primary}`
  }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: color || COLORS.primary }}>{value ?? '—'}</div>
    <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{label}</div>
  </div>
);

export default function AdminPortalPage({ token }) {
  const [tab, setTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '', role: 'DEALING_ASSISTANT' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);



  const [stats, setStats] = useState({
  totalApplications: 0,
  unprocessed: 0,
  pendingApproval: 0,
  approved: 0,
  rejected: 0,
  newRegistrations: 0,
  renewals: 0,
  gnmCount: 0,
  anmCount: 0
});

    const loadUsers = useCallback(async () => {
  try {
    const res = await adminGetUsers(token);

    console.log("USERS API:", res);

    setUsers(Array.isArray(res.data) ? res.data : []);

  } catch (e) {
    console.error(e);
    setMsg({ type: 'error', text: e.message });
    setUsers([]);
  }
}, [token]);

 const loadStats = useCallback(async () => {
  try {
    const res = await adminGetDashboard(token);

    console.log("API RESULT:", res);

    // ✅ FIX HERE
    setStats(res.data || res);

  } catch (e) {
    console.error(e);
    setMsg({ type: 'error', text: e.message });
  }
}, [token]);

    useEffect(() => {
  if (tab === 'users') loadUsers();
  if (tab === 'dashboard') loadStats();
}, [tab, loadUsers, loadStats]); 


  async function handleCreateUser(e) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      await adminCreateUser(token, form);
      setMsg({ type: 'success', text: 'User created successfully.' });
      setForm({ username: '', fullName: '', email: '', password: '', role: 'DEALING_ASSISTANT' });
      loadUsers();
      setTab('users');
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
    setLoading(false);
  }

  async function handleToggleActive(user) {
    try {
      if (user.active) await adminDeactivateUser(token, user.id);
      else await adminActivateUser(token, user.id);
      loadUsers();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
  }

  async function handleChangeRole(userId, newRole) {
    try {
      await adminChangeRole(token, userId, newRole);
      loadUsers();
    } catch (e) { setMsg({ type: 'error', text: e.message }); }
  }

  const tabs = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'users', label: '👥 Users' },
    { id: 'add', label: '➕ Add User' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>
      <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 26, marginBottom: 6 }}>
        Admin Portal
      </h2>
      <p style={{ color: COLORS.textMuted, marginBottom: 24, fontSize: 14 }}>
        Superuser controls — manage staff users and view system statistics
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: `2px solid ${COLORS.border}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer', fontSize: 14,
            background: tab === t.id ? COLORS.primary : 'transparent',
            color: tab === t.id ? '#fff' : COLORS.textMuted,
            borderRadius: '6px 6px 0 0', fontWeight: tab === t.id ? 600 : 400,
            marginBottom: -2, borderBottom: tab === t.id ? `2px solid ${COLORS.primary}` : 'none'
          }}>{t.label}</button>
        ))}
      </div>

      {msg && (
        <div style={{
          background: msg.type === 'success' ? COLORS.successBg : COLORS.dangerBg,
          color: msg.type === 'success' ? COLORS.success : COLORS.danger,
          border: `1px solid ${msg.type === 'success' ? COLORS.success : COLORS.danger}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14
        }}>{msg.text}</div>
      )}

      {/* Dashboard tab */}
      {tab === 'dashboard' && (
        <div>
          <h3 style={{ color: COLORS.text, marginBottom: 16, fontSize: 16, fontWeight: 600 }}>Application Overview</h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
            <StatCard label="Total Applications" value={stats?.totalApplications || 0} color={COLORS.primary} />
            <StatCard label="Unprocessed" value={stats?.unprocessed || 0} color={COLORS.warning} />
            <StatCard label="Pending Approval" value={stats?.pendingApproval || 0} color={COLORS.accent} />
            <StatCard label="Approved" value={stats?.approved || 0} color={COLORS.success} />
            <StatCard label="Rejected" value={stats?.rejected || 0} color={COLORS.danger} />
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <StatCard label="New Registrations" value={stats?.newRegistrations || 0} color="#5c7cfa" />
            <StatCard label="Renewals" value={stats?.renewals || 0} color="#7950f2" />
            <StatCard label="GNM Applications" value={stats?.gnmCount || 0} color="#0ca678" />
            <StatCard label="ANM Applications" value={stats?.anmCount || 0} color="#f76707" />
          </div>
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div>
          <h3 style={{ marginBottom: 16, fontSize: 16, fontWeight: 600, color: COLORS.text }}>
            Staff Accounts ({users.length})
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 10, overflow: 'hidden', border: `1px solid ${COLORS.border}` }}>
            <thead>
              <tr style={{ background: COLORS.lightGray }}>
                {['Username', 'Full Name', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${COLORS.border}`, background: i % 2 === 0 ? '#fff' : '#fafbfd' }}>
                  <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>{u.username}</td>
                  <td style={{ padding: '10px 14px', fontSize: 14 }}>{u.fullName}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: COLORS.textMuted }}>{u.email}</td>
                  <td style={{ padding: '10px 14px' }}>{badge(u.role)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ color: u.active ? COLORS.success : COLORS.danger, fontWeight: 600, fontSize: 13 }}>
                      {u.active ? '✓ Active' : '✗ Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    {u.role !== 'SUPERUSER' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <select
                          value={u.role}
                          onChange={e => handleChangeRole(u.id, e.target.value)}
                          style={{ fontSize: 12, padding: '4px 6px', border: `1px solid ${COLORS.border}`, borderRadius: 4, cursor: 'pointer' }}
                        >
                          {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                        </select>
                        <button onClick={() => handleToggleActive(u)} style={{
                          fontSize: 12, padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                          border: 'none', fontWeight: 600,
                          background: u.active ? COLORS.dangerBg : COLORS.successBg,
                          color: u.active ? COLORS.danger : COLORS.success
                        }}>
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 30, textAlign: 'center', color: COLORS.textMuted }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User tab */}
      {tab === 'add' && (
        <div style={{ maxWidth: 520, background: '#fff', border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 32 }}>
          <h3 style={{ marginBottom: 20, fontSize: 18, color: COLORS.primary, fontFamily: 'EB Garamond' }}>Create New Staff User</h3>
          <form onSubmit={handleCreateUser}>
            {[
              { label: 'Username', key: 'username', type: 'text' },
              { label: 'Full Name', key: 'fullName', type: 'text' },
              { label: 'Email', key: 'email', type: 'email' },
              { label: 'Password', key: 'password', type: 'password' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>{f.label}</label>
                <input
                  type={f.type} required
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14, outline: 'none' }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>Role</label>
              <select
                value={form.role}
                onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 6, fontSize: 14 }}
              >
                {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '11px', background: COLORS.primary, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer'
            }}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
