export function normalizeAcademicContext(context = {}, fallback = {}) {
  return {
    academicYear: context.academicYear || fallback.academicYear || '2025-26',
    campus: context.campus || fallback.campus || 'Main Campus',
    departmentId: context.departmentId || fallback.departmentId || '',
    courseId: context.courseId || fallback.courseId || '',
    semesterId: context.semesterId || fallback.semesterId || '',
  };
}

export function normalizeEntityPayload(payload = {}, { fallbackId = null, fallbackContext = {} } = {}) {
  const now = new Date().toISOString();
  const context = normalizeAcademicContext(payload, fallbackContext);
  const normalized = {
    ...payload,
    ...context,
    id: payload.id || payload.entityId || fallbackId || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: payload.createdAt || now,
    updatedAt: payload.updatedAt || now,
    metadata: payload.metadata || {},
  };

  if (payload.status) {
    normalized.status = payload.status;
  }

  return normalized;
}
