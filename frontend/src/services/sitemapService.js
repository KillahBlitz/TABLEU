import api from './api';

export const getSitemap = async () => {
  return await api.get('/sitemap');
};

export const updateSitemap = async (data) => {
  return await api.put('/sitemap', data);
};

export const uploadSitemapImage = async (file) => {
  const formData = new FormData();
  formData.append('files', file);
  return await api.upload('/sitemap/upload', formData);
};

export const clearSitemap = async () => {
  return await api.delete('/sitemap/clear');
};
