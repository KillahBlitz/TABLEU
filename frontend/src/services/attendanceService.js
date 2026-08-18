import api from './api';

export const attendanceService = {
  getByDate: (date) => api.get(`/attendance?date=${date}`),

  mark: (data) => api.post('/attendance', data),

  bulkMark: (records) => api.post('/attendance/bulk', { records }),

  getSummary: (startDate, endDate) =>
    api.get(`/attendance/summary?startDate=${startDate}&endDate=${endDate}`)
};
