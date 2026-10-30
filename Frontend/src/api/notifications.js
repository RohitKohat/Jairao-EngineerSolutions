import api from './client';

export const getMyNotifications = async ({ unreadOnly = false } = {}) => {
  const params = unreadOnly ? { unread_only: true } : {};
  const { data } = await api.get('/api/notifications', { params });
  return data.notifications || [];
};

export const markNotificationRead = async (id) => {
  const { data } = await api.put(`/api/notifications/${id}/read`);
  return data;
};

export const markAllNotificationsRead = async () => {
  const { data } = await api.put('/api/notifications/read-all');
  return data;
};

export const deleteNotification = async (id) => {
  await api.delete(`/api/notifications/${id}`);
};