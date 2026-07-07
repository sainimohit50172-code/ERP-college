import { createContext, useContext, useState } from 'react';
import {
  useResourceList,
  useCreateResource,
} from '../hooks/useResourceHooks';
import notificationsService from './notificationsService.js';

const defaultERPContext = {
  currentUser: null,
  login: () => {},
  theme: 'light',
  setTheme: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
  notifications: [],
  setNotifications: () => {},
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  permissions: [],
  setPermissions: () => {},
  students: [],
  teachers: [],
  employees: [],
  departments: [],
  courses: [],
  semesters: [],
  sections: [],
  subjects: [],
  timetables: [],
  syllabi: [],
  lectureNotes: [],
  leads: [],
  createStudent: () => {},
  createTeacher: () => {},
  createEmployee: () => {},
  createDepartment: () => {},
  createCourse: () => {},
  createSemester: () => {},
  createSection: () => {},
  createSubject: () => {},
  createTimetable: () => {},
  createSyllabus: () => {},
  createLectureNote: () => {},
  createLead: () => {},
};

const ERPContext = createContext(defaultERPContext);

export function ERPProvider({ children }) {
  // UI-only state
  const [currentUser, setCurrentUser] = useState(null);
  const login = (user) => setCurrentUser(user);

  const [theme, setTheme] = useState('light');
  // `sidebarOpen` controls mobile drawer
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(() => notificationsService.getNotifications());
  const [permissions, setPermissions] = useState([]);

  // Business data fetched via standardized resource hooks
  const studentsList = useResourceList('students', { page: 1, pageSize: 1000 });
  const teachersList = useResourceList('teachers', { page: 1, pageSize: 1000 });
  const employeesList = useResourceList('employees', { page: 1, pageSize: 1000 });
  const departmentsList = useResourceList('departments', { page: 1, pageSize: 1000 });
  const coursesList = useResourceList('courses', { page: 1, pageSize: 1000 });
  const semestersList = useResourceList('semesters', { page: 1, pageSize: 1000 });
  const sectionsList = useResourceList('sections', { page: 1, pageSize: 1000 });
  const subjectsList = useResourceList('subjects', { page: 1, pageSize: 1000 });
  const timetablesList = useResourceList('timetables', { page: 1, pageSize: 1000 });
  const syllabiList = useResourceList('syllabi', { page: 1, pageSize: 1000 });
  const lectureNotesList = useResourceList('lectureNotes', { page: 1, pageSize: 1000 });
  const leadsList = useResourceList('leads', { page: 1, pageSize: 1000 });

  // create mutations
  const createStudent = useCreateResource('students');
  const createTeacher = useCreateResource('teachers');
  const createEmployee = useCreateResource('employees');
  const createDepartment = useCreateResource('departments');
  const createCourse = useCreateResource('courses');
  const createSemester = useCreateResource('semesters');
  const createSection = useCreateResource('sections');
  const createSubject = useCreateResource('subjects');
  const createTimetable = useCreateResource('timetables');
  const createSyllabus = useCreateResource('syllabi');
  const createLectureNote = useCreateResource('lectureNotes');
  const createLead = useCreateResource('leads');

  const markNotificationAsRead = (id) => {
    setNotifications((state) => state.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((state) => state.map((notification) => ({ ...notification, read: true })));
  };

  // subscribe to service updates so other services can push notifications
  // and ERPContext stays in sync.
  notificationsService.subscribe((list) => setNotifications(list));

  return (
    <ERPContext.Provider
      value={{
        // UI-only state
        currentUser,
        login,
        theme,
        setTheme,
        sidebarOpen,
        setSidebarOpen,
        notifications,
        setNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        permissions,
        setPermissions,

        // Business data (sourced from API via standardized hooks)
        students: studentsList.data?.items || [],
        teachers: teachersList.data?.items || [],
        employees: employeesList.data?.items || [],
        departments: departmentsList.data?.items || [],
        courses: coursesList.data?.items || [],
        semesters: semestersList.data?.items || [],
        sections: sectionsList.data?.items || [],
        subjects: subjectsList.data?.items || [],
        timetables: timetablesList.data?.items || [],
        syllabi: syllabiList.data?.items || [],
        lectureNotes: lectureNotesList.data?.items || [],
        leads: leadsList.data?.items || [],

        // creators (mutations)
        createStudent: (payload) => createStudent.mutate(payload),
        createTeacher: (payload) => createTeacher.mutate(payload),
        createEmployee: (payload) => createEmployee.mutate(payload),
        createDepartment: (payload) => createDepartment.mutate(payload),
        createCourse: (payload) => createCourse.mutate(payload),
        createSemester: (payload) => createSemester.mutate(payload),
        createSection: (payload) => createSection.mutate(payload),
        createSubject: (payload) => createSubject.mutate(payload),
        createTimetable: (payload) => createTimetable.mutate(payload),
        createSyllabus: (payload) => createSyllabus.mutate(payload),
        createLectureNote: (payload) => createLectureNote.mutate(payload),
        createLead: (payload) => createLead.mutate(payload),
      }}
    >
      {children}
    </ERPContext.Provider>
  );
}

export function useERP() {
  return useContext(ERPContext);
}
