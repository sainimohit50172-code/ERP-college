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
    if (resource === 'transportRoutes') return mapTransportRouteRecord(item);
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

  return {
    admission_number: payload.admissionNo || payload.admission_number || '',
    first_name: firstName,
    last_name: lastName,
    email: payload.email ?? null,
    phone: payload.phone ?? null,
    date_of_birth: dateOfBirth,
    gender: payload.gender || null,
    status: payload.status || 'Active',
    ...(payload.meta != null ? { meta: payload.meta } : {}),
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

export const mapTransportRoutePayload = (payload = {}) => ({
  ...payload,
  name: payload.name || '',
  start_point: payload.start_point ?? payload.startPoint ?? payload.stops?.[0] ?? 'Start',
  end_point: payload.end_point ?? payload.endPoint ?? payload.stops?.[payload.stops.length - 1] ?? 'End',
  distance_km: Number(payload.distance_km ?? payload.distance ?? 0),
  status: payload.status ?? 'Active',
});

export const mapTransportVehiclePayload = (payload = {}) => ({
  vehicle_number: payload.vehicle_number || payload.vehicleNumber || payload.registration || payload.registration_no || '',
  vehicle_type: payload.vehicle_type || payload.vehicleType || payload.type || 'Bus',
  capacity: Number(payload.capacity || 0),
  status: payload.status || 'active',
});

export const mapTransportVehicleRecord = (record = {}) => ({
  ...record,
  id: record.id,
  registration: record.registration || record.registration_no || record.vehicle_number || '',
  registrationNo: record.registrationNo || record.registration_no || record.vehicle_number || '',
  vehicleNumber: record.vehicleNumber || record.vehicle_number || record.registration_no || '',
  vehicleType: record.vehicleType || record.vehicle_type || '',
  type: record.type || record.vehicle_type || '',
  capacity: record.capacity ?? 0,
  status: record.status || 'Active',
});

export const mapTransportAssignmentPayload = (payload = {}) => ({
  student_id: Number(payload.student_id ?? payload.studentId),
  route_id: Number(payload.route_id ?? payload.routeId),
  vehicle_id: Number(payload.vehicle_id ?? payload.vehicleId),
  assignment_date: payload.assignment_date || payload.assignmentDate || payload.effectiveDate?.slice(0, 10),
  status: String(payload.status || 'assigned').toLowerCase(),
});

export const mapTransportAssignmentRecord = (record = {}) => ({
  ...record,
  id: record.id,
  studentId: record.studentId ?? record.student_id,
  routeId: record.routeId ?? record.route_id,
  vehicleId: record.vehicleId ?? record.vehicle_id,
  assignmentDate: record.assignmentDate ?? record.assignment_date,
  status: record.status || 'Assigned',
});

export const mapTransportRouteRecord = (record = {}) => ({
  ...record,
  id: record.id,
  name: record.name || '',
  startPoint: record.startPoint || record.start_point || '',
  endPoint: record.endPoint || record.end_point || '',
  status: record.status || 'Active',
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

      const res = await api.get(`/${endpoint}`, { params: requestParams });
      return normalizeApiListResponse(res, params, resource);
    },
    get: async (id) => {
      if (repo && typeof repo.get === 'function') {
        const result = await repo.get(id);
        const payload = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payload);
        if (resource === 'classrooms') return mapClassroomRecord(payload);
        if (resource === 'transportRoutes') return mapTransportRouteRecord(payload);
        if (resource === 'transportVehicles') return mapTransportVehicleRecord(payload);
        return payload;
      }

      const res = await api.get(`/${endpoint}/${id}`);
      const payload = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payload);
      if (resource === 'classrooms') return mapClassroomRecord(payload);
      if (resource === 'transportRoutes') return mapTransportRouteRecord(payload);
      if (resource === 'transportVehicles') return mapTransportVehicleRecord(payload);
      if (resource === 'studentTransportAssignments') return mapTransportAssignmentRecord(payload);
      return payload;
    },
    create: async (payload) => {
      const body = resource === 'students'
        ? mapStudentPayload(payload)
        : resource === 'classrooms'
          ? mapClassroomPayload(payload)
          : resource === 'transportRoutes'
            ? mapTransportRoutePayload(payload)
            : resource === 'transportVehicles'
              ? mapTransportVehiclePayload(payload)
              : resource === 'studentTransportAssignments'
                ? mapTransportAssignmentPayload(payload)
            : payload;
      if (repo && typeof repo.create === 'function') {
        const result = await repo.create(body);
        const payloadResult = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payloadResult);
        if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
        if (resource === 'transportRoutes') return mapTransportRouteRecord(payloadResult);
        if (resource === 'transportVehicles') return mapTransportVehicleRecord(payloadResult);
        return payloadResult;
      }

      const res = await api.post(`/${endpoint}`, body);
      const payloadResult = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payloadResult);
      if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
      if (resource === 'transportRoutes') return mapTransportRouteRecord(payloadResult);
      if (resource === 'transportVehicles') return mapTransportVehicleRecord(payloadResult);
      if (resource === 'studentTransportAssignments') return mapTransportAssignmentRecord(payloadResult);
      return payloadResult;
    },
    update: async (id, payload) => {
      const body = resource === 'students'
        ? mapStudentPayload(payload)
        : resource === 'classrooms'
          ? mapClassroomPayload(payload)
          : resource === 'transportRoutes'
            ? mapTransportRoutePayload(payload)
            : resource === 'transportVehicles'
              ? mapTransportVehiclePayload(payload)
              : resource === 'studentTransportAssignments'
                ? mapTransportAssignmentPayload(payload)
            : payload;
      if (repo && typeof repo.update === 'function') {
        const result = await repo.update(id, body);
        const payloadResult = unwrapApiResponse(result);
        if (resource === 'students') return mapStudentRecord(payloadResult);
        if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
        if (resource === 'transportRoutes') return mapTransportRouteRecord(payloadResult);
        if (resource === 'transportVehicles') return mapTransportVehicleRecord(payloadResult);
        return payloadResult;
      }

      const res = await api.put(`/${endpoint}/${id}`, body);
      const payloadResult = unwrapApiResponse(res.data);
      if (resource === 'students') return mapStudentRecord(payloadResult);
      if (resource === 'classrooms') return mapClassroomRecord(payloadResult);
      if (resource === 'transportRoutes') return mapTransportRouteRecord(payloadResult);
      if (resource === 'transportVehicles') return mapTransportVehicleRecord(payloadResult);
      if (resource === 'studentTransportAssignments') return mapTransportAssignmentRecord(payloadResult);
      return payloadResult;
    },
    remove: async (id) => {
      if (repo && typeof repo.remove === 'function') {
        return repo.remove(id);
      }

      const res = await api.delete(`/${endpoint}/${id}`);
      return unwrapApiResponse(res.data) || { success: res.status >= 200 && res.status < 300 };
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
