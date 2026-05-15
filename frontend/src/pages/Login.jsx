import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register({ email, password, full_name: fullName, role: 'Member' });
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card animate-scale" style={{ width: '100%', maxWidth: '440px' }}>
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1>Ethara</h1>
          <p style={{ marginTop: '8px' }}>Professional Team Task Management</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
          {isRegister && (
            <div className="input-group">
              <label>Full Name</label>
              <input className="input-field" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required id="register-name" />
            </div>
          )}
          <div className="input-group">
            <label>Email Address</label>
            <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required id="login-email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required minLength={6} id="login-password" />
          </div>
          
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '16px', height: '44px', fontSize: '1rem', fontWeight: 600 }} type="submit" disabled={loading} id="login-submit">
            {loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsRegister(!isRegister); setError(''); }} 
              style={{ color: 'var(--accent-secondary)', background: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', border: 'none' }} 
              id="toggle-register"
            >
              {isRegister ? 'Sign In' : 'Register Here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
