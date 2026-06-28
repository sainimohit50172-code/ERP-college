import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('examinations');

export const fetchExaminations = async ({ queryKey }) => {
  const [_key, { page = 1, pageSize = 20, search = '', filter = '', examType = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { page, pageSize, search, filter, examType } });
  return res.data;
};

export const fetchExamination = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createExamination = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updateExamination = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deleteExamination = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export const publishExaminationResults = async (id) => {
  const res = await api.post(`/${endpoint}/${id}/publish-results`);
  return res.data;
};

export const generateHallTickets = async ({ examId, studentIds }) => {
  const res = await api.post(`/${endpoint}/${examId}/hall-tickets`, { studentIds });
  return res.data;
};

export default { fetchExaminations, fetchExamination, createExamination, updateExamination, deleteExamination, publishExaminationResults, generateHallTickets };
