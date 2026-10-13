import api from './api';

export const activityService = {
  async getActivities(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(`/activities?${params.toString()}`);
    return response.data.activities;
  },

  async createActivity(activityData) {
    const response = await api.post('/activities', activityData);
    return response.data.activity;
  },

  async getActivityById(id) {
    const response = await api.get(`/activities/${id}`);
    return response.data.activity;
  },

  async updateActivity(id, activityData) {
    const response = await api.put(`/activities/${id}`, activityData);
    return response.data.activity;
  },

  async updateActivityStatus(id, status) {
    const response = await api.patch(`/activities/${id}/status`, { status });
    return response.data.activity;
  },

  async deleteActivity(id) {
    const response = await api.delete(`/activities/${id}`);
    return response.data;
  },
};
