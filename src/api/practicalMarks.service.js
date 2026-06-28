import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('practicalMarks');

export const fetchPracticalMarks = async ({ queryKey }) => {
  const [_key, { page = 1, pageSize = 20, search = '', filter = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { page, pageSize, search, filter } });
  return res.data;
};

export const fetchPracticalMark = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createPracticalMark = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updatePracticalMark = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deletePracticalMark = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export default {
  fetchPracticalMarks,
  fetchPracticalMark,
  createPracticalMark,
  updatePracticalMark,
  deletePracticalMark,
};
