import axios from 'axios';

// In production, VITE_API_URL will point to your Railway backend URL.
// In local dev, it falls back to localhost:8000.
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use((r) => r, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  login: (data) => client.post('/auth/login', data),
  register: (data) => client.post('/auth/register', data),
  googleLogin: (data) => client.post('/auth/google', data),
  setPassword: (data) => client.post('/auth/set-password', data),
  getMe: () => client.get('/auth/me'),
};

export const usersAPI = {
  list: () => client.get('/users/'),
  get: (id) => client.get(`/users/${id}`),
  update: (id, data) => client.put(`/users/${id}`, data),
  delete: (id) => client.delete(`/users/${id}`),
};

export const teamsAPI = {
  list: () => client.get('/teams/'),
  get: (id) => client.get(`/teams/${id}`),
  getMembers: (id) => client.get(`/teams/${id}/members`),
  create: (data) => client.post('/teams/', data),
  update: (id, data) => client.put(`/teams/${id}`, data),
  delete: (id) => client.delete(`/teams/${id}`),
};

export const projectsAPI = {
  list: () => client.get('/projects/'),
  get: (id) => client.get(`/projects/${id}`),
  create: (data) => client.post('/projects/', data),
  update: (id, data) => client.put(`/projects/${id}`, data),
  delete: (id) => client.delete(`/projects/${id}`),
};

export const tasksAPI = {
  list: (params) => client.get('/tasks/', { params }),
  get: (id) => client.get(`/tasks/${id}`),
  create: (data) => client.post('/tasks/', data),
  update: (id, data) => client.put(`/tasks/${id}`, data),
  updateStatus: (id, data) => client.patch(`/tasks/${id}/status`, data),
  assign: (id, data) => client.patch(`/tasks/${id}/assign`, data),
  delete: (id) => client.delete(`/tasks/${id}`),
};

export default client;
