import api from './api';

export const generateSummary = (documentId) => api.post(`/ai/summary/${documentId}`);
export const getSummary = (documentId) => api.get(`/ai/summary/${documentId}`);
export const createChat = (data) => api.post('/ai/chats', data);
export const getChats = (workspaceId) => api.get('/ai/chats', { params: { workspaceId } });
export const getChat = (chatId) => api.get(`/ai/chats/${chatId}`);
export const sendMessage = (chatId, content) => api.post(`/ai/chats/${chatId}/messages`, { content });
export const deleteChat = (chatId) => api.delete(`/ai/chats/${chatId}`);
