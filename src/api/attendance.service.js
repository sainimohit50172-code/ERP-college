import api from './axios';
import { getEndpoint } from './endpoints';

const lectureAttendanceEndpoint = getEndpoint('lectureAttendance');
const studentAttendanceEndpoint = getEndpoint('studentAttendance');

export const fetchLectureAttendance = async () => {
  const res = await api.get(`/${lectureAttendanceEndpoint}`);
  return res.data;
};

export const createLectureAttendance = async (payload) => {
  const res = await api.post(`/${lectureAttendanceEndpoint}`, payload);
  return res.data;
};

export const fetchStudentAttendance = async () => {
  const res = await api.get(`/${studentAttendanceEndpoint}`);
  return res.data;
};

export const createStudentAttendance = async (payload) => {
  const res = await api.post(`/${studentAttendanceEndpoint}`, payload);
  return res.data;
};

export default {
  fetchLectureAttendance,
  createLectureAttendance,
  fetchStudentAttendance,
  createStudentAttendance,
};
