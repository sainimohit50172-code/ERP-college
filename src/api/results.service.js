import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('results');

export const fetchResults = async ({ queryKey }) => {
  const [_key, { page = 1, pageSize = 20, search = '', filter = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { page, pageSize, search, filter } });
  return res.data;
};

export const fetchResult = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createResult = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updateResult = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deleteResult = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export const publishResult = async (id) => {
  const res = await api.post(`/${endpoint}/${id}/publish`);
  return res.data;
};

export default { fetchResults, fetchResult, createResult, updateResult, deleteResult, publishResult };
