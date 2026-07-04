import api from './axios.js';
import { getEndpoint } from './endpoints.js';
import { getRepository } from '../services/repositoryProvider.js';

const unwrapApiResponse = (payload) => {
  if (payload == null) {
    return payload;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object' && 'data' in payload && payload.data !== undefined) {
    return payload.data;
  }

  return payload;
};

export const normalizeApiListResponse = (response, params = {}, resource = 'students') => {
  const payload = unwrapApiResponse(response?.data ?? response);
  const rawItems = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
  const items = rawItems.map((item) => (resource === 'students' ? mapStudentRecord(item) : item));
  const page = Number(payload?.page || params.page || 1);
  const pageSize = Number(payload?.page_size || payload?.pageSize || params.pageSize || rawItems.length || 10);
  const total = Number(payload?.total || rawItems.length || 0);
  const pages = Number(payload?.pages || Math.ceil(total / pageSize) || 1);

  return {
    items,
    total,
    page,
    pageSize,
    pages,
    hasNextPage: page < pages,
    hasPreviousPage: page > 1,
  };
};

export const mapStudentPayload = (payload = {}) => {
  const fullName = String(payload.name || '').trim();
  const [firstName = '', ...rest] = fullName.split(' ');
  const lastName = rest.join(' ');

  return {
    admission_number: payload.admissionNo || payload.admission_number || '',
    first_name: firstName || payload.first_name || '',
    last_name: lastName || payload.last_name || '',
    email: payload.email || null,
    phone: payload.phone || null,
    date_of_birth: payload.date_of_birth || payload.admissionDate || null,
    gender: payload.gender || null,
    status: payload.status || 'Active',
  };
};

export const mapStudentRecord = (record = {}) => ({
  ...record,
  id: record.id,
  name: [record.first_name, record.last_name].filter(Boolean).join(' ').trim() || record.name || '',
  email: record.contact?.email || record.email || '',
  phone: record.contact?.phone || record.phone || '',
  admissionNo: record.admission_number || record.admissionNo || record.admission_no || '',
  firstName: record.first_name || '',
  lastName: record.last_name || '',
  status: record.status || 'Active',
  courseId: record.courseId || '',
  departmentId: record.departmentId || '',
  semesterId: record.semesterId || '',
  sectionId: record.sectionId || '',
  rollNo: record.rollNo || '',
  enrollmentNo: record.enrollmentNo || '',
  address: record.address || '',
  totalFee: record.totalFee || 0,
});

export const createResourceService = (resource) => {
  const endpoint = getEndpoint(resource);
  const repo = getRepository(resource);

  return {
    list: async (params = {}) => {
      if (repo && typeof repo.list === 'function') {
        const result = await repo.list(params);
        return normalizeApiListResponse(result, params, resource);
      }

      const res = await api.get(`/${endpoint}/`, { params });
      return normalizeApiListResponse(res, params, resource);
    },
    get: async (id) => {
      if (repo && typeof repo.get === 'function') {
        const result = await repo.get(id);
        const payload = unwrapApiResponse(result);
        return resource === 'students' ? mapStudentRecord(payload) : payload;
      }

      const res = await api.get(`/${endpoint}/${id}`);
      const payload = unwrapApiResponse(res.data);
      return resource === 'students' ? mapStudentRecord(payload) : payload;
    },
    create: async (payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : payload;
      if (repo && typeof repo.create === 'function') {
        const result = await repo.create(body);
        const payloadResult = unwrapApiResponse(result);
        return resource === 'students' ? mapStudentRecord(payloadResult) : payloadResult;
      }

      const res = await api.post(`/${endpoint}/`, body);
      const payloadResult = unwrapApiResponse(res.data);
      return resource === 'students' ? mapStudentRecord(payloadResult) : payloadResult;
    },
    update: async (id, payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : payload;
      if (repo && typeof repo.update === 'function') {
        const result = await repo.update(id, body);
        const payloadResult = unwrapApiResponse(result);
        return resource === 'students' ? mapStudentRecord(payloadResult) : payloadResult;
      }

      const res = await api.put(`/${endpoint}/${id}`, body);
      const payloadResult = unwrapApiResponse(res.data);
      return resource === 'students' ? mapStudentRecord(payloadResult) : payloadResult;
    },
    remove: async (id) => {
      if (repo && typeof repo.remove === 'function') {
        return repo.remove(id);
      }

      const res = await api.delete(`/${endpoint}/${id}`);
      return unwrapApiResponse(res.data);
    },
    search: async (q) => {
      if (repo && typeof repo.search === 'function') {
        const result = await repo.search(q);
        return normalizeApiListResponse(result, { page: 1, pageSize: 20 }, resource);
      }

      const res = await api.get(`/${endpoint}/search`, { params: { q } });
      return normalizeApiListResponse(res, { page: 1, pageSize: 20 }, resource);
    },
  };
};

export default createResourceService;
