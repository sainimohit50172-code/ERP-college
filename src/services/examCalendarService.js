import createResourceService from '../api/resourceService.js';

const examCalendarService = createResourceService('examCalendars');

export function getExamCalendars(params = {}) {
  return examCalendarService.list(params);
}

export function getExamCalendarById(id) {
  return examCalendarService.get(id);
}

export function createExamCalendar(payload) {
  return examCalendarService.create(payload);
}

export function updateExamCalendar(id, payload) {
  return examCalendarService.update(id, payload);
}

export function deleteExamCalendar(id) {
  return examCalendarService.remove(id);
}

export default {
  getExamCalendars,
  getExamCalendarById,
  createExamCalendar,
  updateExamCalendar,
  deleteExamCalendar,
};
