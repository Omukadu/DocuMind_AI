import api from './api';

export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const updateAdminUser = (userId, data) => api.put(`/admin/users/${userId}`, data);
export const getAdminWorkspaces = () => api.get('/admin/workspaces');
export const getAnalytics = () => api.get('/admin/analytics');
export const getAuditLogs = (params) => api.get('/admin/audit-logs', { params });
