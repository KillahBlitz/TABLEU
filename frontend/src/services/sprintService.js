import api from './api';

export const sprintService = {
  getSprints: () => api.get('/sprints'),
  createSprint: (sprintData) => api.post('/sprints', sprintData),
  updateSprint: (id, sprintData) => api.put(`/sprints/${id}`, sprintData),
  startSprint: (id) => api.put(`/sprints/${id}/start`, {}),
  finishSprint: (id, options = { moveIncompleteToBacklog: true }) => api.put(`/sprints/${id}/finish`, options),
  deleteSprint: (id) => api.delete(`/sprints/${id}`)
};
