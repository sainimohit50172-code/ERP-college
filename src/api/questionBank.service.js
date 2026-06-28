import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('questionBank');

export const fetchQuestions = async ({ queryKey }) => {
  const [_key, { page = 1, pageSize = 20, search = '', filter = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { page, pageSize, search, filter } });
  return res.data;
};

export const fetchQuestion = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createQuestion = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updateQuestion = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deleteQuestion = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export default { fetchQuestions, fetchQuestion, createQuestion, updateQuestion, deleteQuestion };
