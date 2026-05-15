import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TasksView from './pages/TasksView';
import Projects from './pages/Projects';
import TeamManagement from './pages/TeamManagement';
import UserManagement from './pages/UserManagement';
import TeamAdmin from './pages/TeamAdmin';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner"></div></div>;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TasksView />} />
        <Route path="projects" element={<Projects />} />
        <Route path="team" element={<ProtectedRoute roles={['QL']}><TeamManagement /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute roles={['Admin']}><UserManagement /></ProtectedRoute>} />
        <Route path="teams" element={<ProtectedRoute roles={['Admin']}><TeamAdmin /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
