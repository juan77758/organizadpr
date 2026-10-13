import api from './api';

export const notificationService = {
  async getNotifications(limit = 50) {
    const response = await api.get(`/notifications?limit=${limit}`);
    return response.data.notifications;
  },

  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data.notification;
  },

  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
