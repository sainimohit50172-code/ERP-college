// FastAPI repository adapters - small stubs that call REST endpoints using the axios client.
import api from '../../../api/axios.js';
import { getEndpoint } from '../../../api/endpoints.js';

function createFastApiRepo(resource) {
  const endpoint = getEndpoint(resource);
  return {
    list: async (params = {}) => {
      const res = await api.get(`/${endpoint}`, { params });
      return res.data;
    },
    get: async (id) => {
      const res = await api.get(`/${endpoint}/${id}`);
      return res.data;
    },
    create: async (payload) => {
      const res = await api.post(`/${endpoint}`, payload);
      return res.data;
    },
    update: async (id, payload) => {
      const res = await api.put(`/${endpoint}/${id}`, payload);
      return res.data;
    },
    remove: async (id) => {
      const res = await api.delete(`/${endpoint}/${id}`);
      return res.data;
    },
    search: async (q) => {
      const res = await api.get(`/${endpoint}/search`, { params: { q } });
      return res.data;
    },
  };
}

const exporters = new Proxy({}, {
  get: (_, resource) => createFastApiRepo(resource),
});

export default exporters;
