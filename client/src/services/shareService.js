import api from './api';

export const createShare = (data) => api.post('/shares', data);
export const getShares = (documentId) => api.get(`/shares/document/${documentId}`);
export const accessSharedDocument = (token, password) => api.post(`/shares/access/${token}`, { password });
export const revokeShare = (shareId) => api.delete(`/shares/${shareId}`);
