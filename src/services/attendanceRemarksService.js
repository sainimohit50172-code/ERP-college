import createResourceService from '../api/resourceService.js';

const attendanceRemarksApi = createResourceService('remarks');

export async function getAttendanceRemarks(params = {}) {
  return attendanceRemarksApi.list(params);
}

export async function createAttendanceRemark(payload) {
  return attendanceRemarksApi.create(payload);
}

export async function updateAttendanceRemark(id, payload) {
  return attendanceRemarksApi.update(id, payload);
}

export async function deleteAttendanceRemark(id) {
  return attendanceRemarksApi.remove(id);
}

export default {
  getAttendanceRemarks,
  createAttendanceRemark,
  updateAttendanceRemark,
  deleteAttendanceRemark,
};
