import api from './api';

export const roleService = {
  getRoles: () => api.get('/roles'),
  createRole: (data) => api.post('/roles', data),
  updateRole: (id, data) => api.put(`/roles/${id}`, data)
};
