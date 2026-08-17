import api from './api';

export const kpiService = {
  getSummary: () => api.get('/kpis/summary'),
  getByUser: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/kpis/by-user${query ? `?${query}` : ''}`);
  },
  getByEpic: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/kpis/by-epic${query ? `?${query}` : ''}`);
  },
  getBySprint: (sprintId) => api.get(`/kpis/sprint/${sprintId}`)
};
