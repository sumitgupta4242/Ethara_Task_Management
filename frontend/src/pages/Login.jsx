import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconGoogle } from '../components/icons/SvgIcons';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { login, register, googleLogin, setPassword: setPass } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role: 'Member' });
      } else {
        const result = await login(email, password);
        if (result.needs_password) { setShowPasswordModal(true); setLoading(false); return; }
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    try {
      await setPass(newPassword);
      setShowPasswordModal(false);
      navigate('/');
    } catch (err) { setError(err.response?.data?.detail || 'Failed to set password'); }
  };

  return (
    <div className="login-page">
      <div className="login-card animate-scale">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h1>Ethara</h1>
          <p>Team Task Management System</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        {showPasswordModal ? (
          <form onSubmit={handleSetPassword}>
            <div className="password-modal-info">Your account was created via Google. Please set a password to complete your account setup.</div>
            <div className="input-group">
              <label>Create Password</label>
              <input className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%' }} type="submit">Set Password & Continue</button>
          </form>
        ) : (
          <>
            <button className="google-btn" type="button" onClick={() => alert('Configure GOOGLE_CLIENT_ID in .env to enable Google Sign-In')}>
              <IconGoogle /> Continue with Google
            </button>
            <div className="login-divider">or</div>
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="input-group">
                  <label>Full Name</label>
                  <input className="input-field" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" required />
                </div>
              )}
              <div className="input-group">
                <label>Email</label>
                <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input className="input-field" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required minLength={6} />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }} type="submit" disabled={loading}>
                {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{ color: 'var(--accent-secondary)', background: 'none', fontWeight: 600 }}>
                {isRegister ? 'Sign In' : 'Register'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
