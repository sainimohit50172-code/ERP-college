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
  const items = rawItems.map((item) => {
    if (resource === 'students') return mapStudentRecord(item);
    if (resource === 'classrooms') return mapClassroomRecord(item);
    return item;
  });
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
  const [embeddedFirstName = '', ...embeddedRest] = fullName.split(' ').filter(Boolean);
  const embeddedLastName = embeddedRest.join(' ');
  const firstName = payload.firstName || payload.first_name || embeddedFirstName || '';
  const lastName = payload.lastName || payload.last_name || embeddedLastName || '';
  const dateOfBirth = payload.dateOfBirth || payload.date_of_birth || payload.admissionDate || null;

  const contact = {
    ...(payload.email != null ? { email: payload.email } : {}),
    ...(payload.phone != null ? { phone: payload.phone } : {}),
  };

  return {
    admission_number: payload.admissionNo || payload.admission_number || '',
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dateOfBirth,
    gender: payload.gender || null,
    status: payload.status || 'Active',
    contact: Object.keys(contact).length > 0 ? contact : undefined,
    meta: payload.meta ?? null,
  };
};

export const mapStudentRecord = (record = {}) => ({
  ...record,
  id: record.id,
  name: [record.first_name, record.last_name].filter(Boolean).join(' ').trim() || record.name || '',
  email: record.contact?.email || record.email || '',
  phone: record.contact?.phone || record.phone || '',
  admissionNo: record.admission_number || record.admissionNo || record.admission_no || '',
  dateOfBirth: record.date_of_birth || record.dob || record.dateOfBirth || '',
  gender: record.gender || '',
  firstName: record.first_name || '',
  lastName: record.last_name || '',
  status: record.status || 'Active',
  courseId: record.courseId || '',
  departmentId: record.departmentId || '',
  semesterId: record.semesterId || '',
  sectionId: record.sectionId || '',
  rollNo: record.rollNo || record.roll_no || '',
  enrollmentNo: record.enrollmentNo || record.enrollment_no || '',
  address: record.address || '',
  totalFee: record.totalFee || 0,
});

export const mapClassroomPayload = (payload = {}) => ({
  hostel_id: payload.hostelId || payload.hostel_id || 1,
  room_number: payload.roomNumber || payload.room_number || '',
  capacity: Number(payload.capacity || payload.roomCapacity || 0),
  building: payload.building || payload.block || null,
  floor: payload.floor || null,
  has_projector: payload.hasProjector ?? payload.has_projector ?? false,
  has_lab: payload.hasLab ?? payload.has_lab ?? false,
  has_ac: payload.hasAC ?? payload.has_ac ?? false,
  status: payload.status || 'Active',
});

export const mapClassroomRecord = (record = {}) => ({
  ...record,
  id: record.id,
  roomNumber: record.room_number || record.roomNumber || '',
  name: record.room_number || record.roomNumber || record.name || '',
  code: record.room_number || record.roomNumber || record.code || '',
  hostelId: record.hostel_id || record.hostelId || null,
  capacity: record.capacity ?? 0,
  status: record.status || 'Active',
  building: record.building || record.block || record.block_name || '',
  floor: record.floor || record.level || '',
  hasProjector: record.has_projector ?? record.hasProjector ?? false,
  hasLab: record.has_lab ?? record.hasLab ?? false,
  hasAC: record.has_ac ?? record.hasAC ?? false,
});

const normalizeListParams = (params = {}) => {
  const normalized = { ...params };
  const requestedPageSize = Number(normalized.pageSize ?? normalized.page_size ?? 10);
  const clampedPageSize = Number.isFinite(requestedPageSize) ? Math.min(100, Math.max(1, requestedPageSize)) : 10;

  if ('pageSize' in normalized) {
    normalized.page_size = clampedPageSize;
    delete normalized.pageSize;
  } else if ('page_size' in normalized) {
    normalized.page_size = clampedPageSize;
  }

  if ('sortBy' in normalized) {
    normalized.sort_by = normalized.sortBy;
    delete normalized.sortBy;
  }
  if ('sortOrder' in normalized) {
    normalized.sort_order = normalized.sortOrder;
    delete normalized.sortOrder;
  }
  return normalized;
};

export const createResourceService = (resource) => {
  const endpoint = getEndpoint(resource);
  const repo = getRepository(resource);

  return {
    list: async (params = {}) => {
      const requestParams = normalizeListParams(params);
      if (repo && typeof repo.list === 'function') {
        const result = await repo.list(requestParams);
        return normalizeApiListResponse(result, params, resource);
      }

      const res = await api.get(`/${endpoint}/`, { params: requestParams });
      return normalizeApiListResponse(res, params, resource);
    },
    get: async (id) => {
      if (repo && typeof repo.get === 'function') {
        const result = await repo.get(id);
        const payload = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payload);
        if (resource === 'classrooms') return mapClassroomRecord(payload);
        return payload;
      }

      const res = await api.get(`/${endpoint}/${id}`);
      const payload = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payload);
      if (resource === 'classrooms') return mapClassroomRecord(payload);
      return payload;
    },
    create: async (payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : resource === 'classrooms' ? mapClassroomPayload(payload) : payload;
      if (repo && typeof repo.create === 'function') {
        const result = await repo.create(body);
        const payloadResult = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payloadResult);
        if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
        return payloadResult;
      }

      const res = await api.post(`/${endpoint}/`, body);
      const payloadResult = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payloadResult);
      if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
      return payloadResult;
    },
    update: async (id, payload) => {
      const body = resource === 'students' ? mapStudentPayload(payload) : resource === 'classrooms' ? mapClassroomPayload(payload) : payload;
      if (repo && typeof repo.update === 'function') {
        const result = await repo.update(id, body);
        const payloadResult = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payloadResult);
        if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
        return payloadResult;
      }

      const res = await api.put(`/${endpoint}/${id}`, body);
      const payloadResult = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payloadResult);
      if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
      return payloadResult;
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
