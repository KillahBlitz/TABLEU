import api from './api';

export const boardService = {
  getStories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/stories${query ? `?${query}` : ''}`);
  },
  getStoryById: (id) => api.get(`/stories/${id}`),
  createStory: (storyData) => api.post('/stories', storyData),
  updateStory: (id, storyData) => api.put(`/stories/${id}`, storyData),
  updateStatus: (id, status, order) => api.put(`/stories/${id}/status`, { status, order }),
  deleteStory: (id) => api.delete(`/stories/${id}`),

  uploadAttachments: (storyId, files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return api.upload(`/stories/${storyId}/attachments`, formData);
  },

  deleteAttachment: (storyId, attachmentId) =>
    api.delete(`/stories/${storyId}/attachments/${attachmentId}`)
};
