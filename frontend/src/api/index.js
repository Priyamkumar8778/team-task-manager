const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

const request = async (method, path, body) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const api = {
  get:    (path)        => request('GET', path),
  post:   (path, body)  => request('POST', path, body),
  patch:  (path, body)  => request('PATCH', path, body),
  delete: (path)        => request('DELETE', path),
};

// Auth
export const authApi = {
  login:    (body) => api.post('/auth/login', body),
  register: (body) => api.post('/auth/register', body),
  me:       ()     => api.get('/auth/me'),
};

// Projects
export const projectApi = {
  list:         ()              => api.get('/projects'),
  get:          (id)            => api.get(`/projects/${id}`),
  create:       (body)          => api.post('/projects', body),
  delete:       (id)            => api.delete(`/projects/${id}`),
  addMember:    (id, userId)    => api.post(`/projects/${id}/members`, { userId }),
  removeMember: (id, userId)    => api.delete(`/projects/${id}/members/${userId}`),
};

// Tasks
export const taskApi = {
  list:      (params = {}) => api.get(`/tasks?${new URLSearchParams(params)}`),
  dashboard: ()            => api.get('/tasks/dashboard'),
  create:    (body)        => api.post('/tasks', body),
  update:    (id, body)    => api.patch(`/tasks/${id}`, body),
  delete:    (id)          => api.delete(`/tasks/${id}`),
};

// Users
export const userApi = {
  list: () => api.get('/users'),
};