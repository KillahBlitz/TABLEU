import api from './api';

export const getSitemap = async () => {
  return await api.get('/sitemap');
};

export const updateSitemap = async (data) => {
  return await api.put('/sitemap', data);
};

export const uploadSitemapImage = async (file) => {
  const formData = new FormData();
  const filename = file.name || `image_${Date.now()}.png`;
  formData.append('files', file, filename);
  return await api.upload('/sitemap/upload', formData);
};

export const clearSitemap = async () => {
  return await api.delete('/sitemap/clear');
};
