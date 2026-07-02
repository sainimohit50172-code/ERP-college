import api from './axios.js';
import { getEndpoint } from './endpoints.js';
import { getRepository } from '../services/repositoryProvider.js';

export const normalizeApiListResponse = (response, params = {}) => {
  const payload = response?.data ?? response;
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const page = Number(payload?.page || params.page || 1);
  const pageSize = Number(payload?.page_size || payload?.pageSize || params.pageSize || items.length || 10);

  return {
    items: items.map(mapStudentRecord),
    total: Number(payload?.total || items.length || 0),
    page,
    pageSize,
    pages: Number(payload?.pages || Math.ceil((payload?.total || items.length || 0) / pageSize) || 1),
    hasNextPage: page < Math.ceil((payload?.total || items.length || 0) / pageSize),
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
        if (resource === 'students') {
          return normalizeApiListResponse(result, params);
        }
        return result;
      }

      const res = await api.get(`/${endpoint}`, { params });
      if (resource === 'students') {
        return normalizeApiListResponse(res.data, params);
      }
      return res.data;
    },
    get: async (id) => {
      if (repo && typeof repo.get === 'function') {
        const result = await repo.get(id);
        return resource === 'students' ? mapStudentRecord(result?.data ?? result) : result;
      }

      const res = await api.get(`/${endpoint}/${id}`);
      return resource === 'students' ? mapStudentRecord(res.data?.data ?? res.data) : res.data;
    },
    create: async (payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : payload;
      if (repo && typeof repo.create === 'function') {
        const result = await repo.create(body);
        return resource === 'students' ? mapStudentRecord(result?.data ?? result) : result;
      }

      const res = await api.post(`/${endpoint}`, body);
      return resource === 'students' ? mapStudentRecord(res.data?.data ?? res.data) : res.data;
    },
    update: async (id, payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : payload;
      if (repo && typeof repo.update === 'function') {
        const result = await repo.update(id, body);
        return resource === 'students' ? mapStudentRecord(result?.data ?? result) : result;
      }

      const res = await api.put(`/${endpoint}/${id}`, body);
      return resource === 'students' ? mapStudentRecord(res.data?.data ?? res.data) : res.data;
    },
    remove: async (id) => {
      if (repo && typeof repo.remove === 'function') {
        return repo.remove(id);
      }

      const res = await api.delete(`/${endpoint}/${id}`);
      return res.data;
    },
    search: async (q) => {
      if (repo && typeof repo.search === 'function') {
        const result = await repo.search(q);
        return resource === 'students' ? normalizeApiListResponse(result, { page: 1, pageSize: 20 }) : result;
      }

      const res = await api.get(`/${endpoint}/search`, { params: { q } });
      return resource === 'students' ? normalizeApiListResponse(res.data, { page: 1, pageSize: 20 }) : res.data;
    },
  };
};

export default createResourceService;
