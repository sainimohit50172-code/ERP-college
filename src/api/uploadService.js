import api from './axios';
import { getEndpoint } from './endpoints';

const uploadService = {
  upload: async (resource, formData) => {
    const endpoint = getEndpoint(resource);
    const res = await api.post(`/${endpoint}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  download: async (resource, params = {}) => {
    const endpoint = getEndpoint(resource);
    const res = await api.get(`/${endpoint}/download`, { params, responseType: 'blob' });
    return res.data;
  }
};

export default uploadService;
