import api from './api';

export const epicService = {
  getEpics: () => api.get('/epics'),
  createEpic: (epicData) => api.post('/epics', epicData),
  updateEpic: (id, epicData) => api.put(`/epics/${id}`, epicData),
  deleteEpic: (id) => api.delete(`/epics/${id}`)
};
