import api from './api';

export const getNotifications = (params) => api.get('/notifications', { params });
export const markAsRead = (id) => api.patch(`/notifications/${id}`);
export const markAllAsRead = () => api.post('/notifications/mark-all-read');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);
