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
    api.delete(`/stories/${storyId}/attachments/${attachmentId}`),

  getAttachmentFileUrl: (storyId, attachmentId) =>
    `/api/stories/${storyId}/attachments/${attachmentId}/file`,

  getAttachmentDownloadUrl: (storyId, attachmentId) =>
    `/api/stories/${storyId}/attachments/${attachmentId}/download`,

  downloadAttachment: async (storyId, attachment) => {
    const token = localStorage.getItem('tableu_token');
    const response = await fetch(`/api/stories/${storyId}/attachments/${attachment._id}/download`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al descargar el archivo');
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = attachment.originalName || 'archivo';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
};
