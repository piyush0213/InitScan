import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

// Transactions
export const getTransactions = (params) => api.get('/transactions', { params }).then(r => r.data);
export const getTransaction = (hash) => api.get(`/transactions/${hash}`).then(r => r.data);

// AI Query
export const postQuery = (question) => api.post('/query', { question }).then(r => r.data);

// Analytics
export const getAnalyticsSummary = () => api.get('/analytics/summary').then(r => r.data);
export const getChainAnalytics = (chainId) => api.get(`/analytics/chain/${chainId}`).then(r => r.data);

// Health
export const getRollupHealth = () => api.get('/health/rollups').then(r => r.data);

// Alerts
export const getAlerts = () => api.get('/alerts').then(r => r.data);
export const createAlert = (data) => api.post('/alerts', data).then(r => r.data);
export const updateAlert = (id, data) => api.patch(`/alerts/${id}`, data).then(r => r.data);
export const deleteAlert = (id) => api.delete(`/alerts/${id}`).then(r => r.data);

export default api;
