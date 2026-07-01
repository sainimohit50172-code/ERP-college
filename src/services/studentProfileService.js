import createResourceService from '../api/resourceService.js';

const studentProfileService = createResourceService('students');

export function listStudentProfiles(params) {
  return studentProfileService.list(params);
}

export function getStudentProfile(id) {
  return studentProfileService.get(id);
}

export function createStudentProfile(payload) {
  return studentProfileService.create(payload);
}

export function updateStudentProfile(id, payload) {
  return studentProfileService.update(id, payload);
}

export default studentProfileService;
