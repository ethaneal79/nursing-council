import React, { useState } from 'react';
import { COLORS } from '../styles/theme';
import { staffLogin } from '../services/api';

export default function StaffLoginPage({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
     const res = await staffLogin(
  form.username,
  form.password
);

console.log(res);

if (res?.data?.token) {

  onLogin(res.data);

} else {

  setError('Login failed. Please check your credentials.');

      }
    } catch (e) { setError(e.message || 'Login failed'); }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: COLORS.offWhite, padding: 20
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, border: `1px solid ${COLORS.border}`,
        padding: '40px 36px', width: 400, maxWidth: '100%',
        boxShadow: '0 4px 24px rgba(26,60,110,0.10)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏥</div>
          <h2 style={{ color: COLORS.primary, fontFamily: 'EB Garamond', fontSize: 22, margin: 0 }}>
            Staff Portal
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 6 }}>
            Meghalaya State Nursing Council
          </p>
        </div>

        {error && (
          <div style={{
            background: COLORS.dangerBg, color: COLORS.danger,
            border: `1px solid ${COLORS.danger}`, borderRadius: 8,
            padding: '10px 14px', marginBottom: 18, fontSize: 13
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
              Username
            </label>
            <input
              type="text" required autoFocus
              value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 15, outline: 'none' }}
              placeholder="Enter your username"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
              Password
            </label>
            <input
              type="password" required
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              style={{ width: '100%', padding: '10px 12px', border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 15, outline: 'none' }}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '12px', background: COLORS.primary, color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer',
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: COLORS.textMuted, fontSize: 12, marginTop: 20 }}>
          For staff use only. Public portal is available on the home page.
        </p>
      </div>
    </div>
  );
}
