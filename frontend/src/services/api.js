import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Documents API
export const documentsAPI = {
  create: (formData) => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  sign: (id, data) => api.post(`/documents/${id}/sign`, data),
  sendSignatureRequest: (id) => api.post(`/documents/${id}/send`),
  delete: (id) => api.delete(`/documents/${id}`)
};

// Leads API
export const leadsAPI = {
  create: (data) => api.post('/leads', data),
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  update: (id, data) => api.put(`/leads/${id}`, data),
  addNote: (id, data) => api.post(`/leads/${id}/notes`, data),
  delete: (id) => api.delete(`/leads/${id}`)
};

// Commissions API
export const commissionsAPI = {
  create: (data) => api.post('/commissions', data),
  getAll: (params) => api.get('/commissions', { params }),
  getById: (id) => api.get(`/commissions/${id}`),
  update: (id, data) => api.put(`/commissions/${id}`, data),
  delete: (id) => api.delete(`/commissions/${id}`)
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getReferrers: () => api.get('/users/referrers/list')
};

export default api;
