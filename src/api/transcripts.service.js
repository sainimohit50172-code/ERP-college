import api from './axios';
import { getEndpoint } from './endpoints';

const endpoint = getEndpoint('transcripts');

export const fetchTranscripts = async ({ queryKey }) => {
  const [_key, { studentId = '', page = 1, pageSize = 20, search = '' } = {}] = queryKey;
  const res = await api.get(`/${endpoint}`, { params: { studentId, page, pageSize, search } });
  return res.data;
};

export const fetchTranscript = async (id) => {
  const res = await api.get(`/${endpoint}/${id}`);
  return res.data;
};

export const createTranscript = async (payload) => {
  const res = await api.post(`/${endpoint}`, payload);
  return res.data;
};

export const updateTranscript = async ({ id, payload }) => {
  const res = await api.put(`/${endpoint}/${id}`, payload);
  return res.data;
};

export const deleteTranscript = async (id) => {
  const res = await api.delete(`/${endpoint}/${id}`);
  return res.data;
};

export const exportTranscript = async ({ id, format = 'pdf' }) => {
  const res = await api.get(`/${endpoint}/${id}/export`, { params: { format }, responseType: 'blob' });
  return res.data;
};

export default { fetchTranscripts, fetchTranscript, createTranscript, updateTranscript, deleteTranscript, exportTranscript };
