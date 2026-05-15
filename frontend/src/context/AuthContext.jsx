import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authAPI.getMe().then(r => { setUser(r.data); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else { setLoading(false); }
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, needs_password } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const me = await authAPI.getMe();
    setUser(me.data);
    return { needs_password };
  };

  const googleLogin = async (credential) => {
    const res = await authAPI.googleLogin({ credential });
    const { access_token, needs_password } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    const me = await authAPI.getMe();
    setUser(me.data);
    return { needs_password };
  };

  const register = async (data) => {
    await authAPI.register(data);
    return login(data.email, data.password);
  };

  const setPassword = async (password) => {
    await authAPI.setPassword({ password });
    const me = await authAPI.getMe();
    setUser(me.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const me = await authAPI.getMe();
    setUser(me.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, googleLogin, register, logout, setPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
