import createResourceService from '../api/resourceService.js';

const teacherProfileService = createResourceService('teachers');

export function getTeacherProfile(id) {
  return teacherProfileService.get(id);
}

export function listTeacherProfiles(params) {
  return teacherProfileService.list(params);
}

export default teacherProfileService;
