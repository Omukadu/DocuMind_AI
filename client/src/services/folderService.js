import api from './api';

export const createFolder = (data) => api.post('/folders', data);
export const getFolders = (params) => api.get('/folders', { params });
export const getFolder = (id) => api.get(`/folders/${id}`);
export const updateFolder = (id, data) => api.put(`/folders/${id}`, data);
export const deleteFolder = (id) => api.delete(`/folders/${id}`);
