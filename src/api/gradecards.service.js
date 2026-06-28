import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('gradecards');

export const fetchGradeCards = async ({ queryKey }) => {
  const [_key, { page = 1, pageSize = 20, search = '', filter = '', studentId = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { page, pageSize, search, filter, studentId } });
  return res.data;
};

export const fetchGradeCard = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createGradeCard = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updateGradeCard = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deleteGradeCard = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export const recalculateGradeCard = async (id) => {
  const res = await api.post(`/${endpoint}/${id}/recalculate`);
  return res.data;
};

export default { fetchGradeCards, fetchGradeCard, createGradeCard, updateGradeCard, deleteGradeCard, recalculateGradeCard };
