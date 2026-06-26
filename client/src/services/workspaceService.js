import api from './api';

export const createWorkspace = (data) => api.post('/workspaces', data);
export const getWorkspaces = () => api.get('/workspaces');
export const getWorkspace = (id) => api.get(`/workspaces/${id}`);
export const updateWorkspace = (id, data) => api.put(`/workspaces/${id}`, data);
export const getWorkspaceStats = (id) => api.get(`/workspaces/${id}/stats`);
export const getWorkspaceMembers = (id) => api.get(`/workspaces/${id}/members`);
export const inviteMember = (id, data) => api.post(`/workspaces/${id}/members`, data);
export const updateMemberRole = (id, userId, role) => api.put(`/workspaces/${id}/members/${userId}`, { role });
export const removeMember = (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`);
