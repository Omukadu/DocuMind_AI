import api from './api';

export const uploadDocuments = (formData, onProgress) =>
  api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const getDocuments = (params) => api.get('/documents', { params });
export const getDocument = (id) => api.get(`/documents/${id}`);
export const updateDocument = (id, data) => api.put(`/documents/${id}`, data);
export const saveNotes = (id, notes) => api.patch(`/documents/${id}/notes`, { notes });
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const bulkDeleteDocuments = (ids) => api.post('/documents/bulk-delete', { ids });
export const downloadDocument = (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' });
export const toggleFavorite = (id) => api.post(`/documents/${id}/favorite`);
export const moveDocuments = (ids, folderId) => api.post('/documents/move', { ids, folderId });
export const reprocessDocument = (id) => api.post(`/documents/${id}/reprocess`);
