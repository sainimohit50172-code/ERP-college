import { createContext, useContext, useState } from 'react';
import {
  useResourceList,
  useCreateResource,
} from '../hooks/useResourceHooks';
import notificationsService from './notificationsService.js';

const MASTER_DATA_FALLBACKS = {
  colleges: [
    'Roorkee College of Smart Computing',
    'Roorkee College of Engineering',
    'Roorkee College of Business Studies',
    'Roorkee College of Agricultural Sciences',
    'Roorkee College of Allied Health Sciences',
  ],
  departments: ['Administration', 'Finance', 'Academic', 'Support'],
  courses: ['B.Tech CSE', 'B.Tech ECE', 'B.Tech Mechanical', 'MBA', 'BCA'],
  academicSessions: ['2023-24', '2024-25', '2025-26', '2026-27'],
  semesters: ['1', '2', '3', '4', '5', '6', '7', '8'],
  sections: ['A', 'B', 'C', 'D'],
  subjects: ['Mathematics', 'Physics', 'DBMS', 'Operating System', 'Computer Networks'],
  feeHeads: ['Tuition Fee', 'Hostel Fee', 'Transport Fee', 'Library Fee'],
  feeCategories: ['GENERAL', 'ACADEMIC', 'TRANSPORT', 'HOSTEL'],
  feeHeadGroups: ['Academic', 'Hostel', 'Transport'],
  installments: ['1', '2', '3', '4'],
  users: ['Admin', 'Faculty', 'Student'],
  roles: ['Admin', 'Faculty', 'Student', 'Accountant'],
  employees: ['Admin', 'Faculty', 'Support'],
  teachers: ['Dr. Amit Sharma', 'Prof. Neha Verma', 'Prof. Rahul Singh'],
  hostels: ['Boys Hostel', 'Girls Hostel'],
  transport: ['Route A', 'Route B', 'Route C'],
  libraryMasters: ['Library Book', 'Library Member'],
  coeMasters: ['Exam Form', 'Result Processing'],
};

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
  academicSessions: [],
  semesters: [],
  sections: [],
  subjects: [],
  feeHeads: [],
  feeCategories: [],
  feeHeadGroups: [],
  installments: [],
  users: [],
  roles: [],
  hostels: [],
  transport: [],
  libraryMasters: [],
  coeMasters: [],
  timetables: [],
  syllabi: [],
  lectureNotes: [],
  leads: [],
  colleges: [],
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
  const collegesList = useResourceList('colleges', { page: 1, pageSize: 1000 });
  const coursesList = useResourceList('courses', { page: 1, pageSize: 1000 });
  const academicSessionsList = useResourceList('academicSessions', { page: 1, pageSize: 1000 });
  const semestersList = useResourceList('semesters', { page: 1, pageSize: 1000 });
  const sectionsList = useResourceList('sections', { page: 1, pageSize: 1000 });
  const subjectsList = useResourceList('subjects', { page: 1, pageSize: 1000 });
  const feeHeadsList = useResourceList('feeHeads', { page: 1, pageSize: 1000 });
  const feeCategoriesList = useResourceList('feeCategories', { page: 1, pageSize: 1000 });
  const feeHeadGroupsList = useResourceList('feeHeadGroups', { page: 1, pageSize: 1000 });
  const installmentsList = useResourceList('installments', { page: 1, pageSize: 1000 });
  const usersList = useResourceList('users', { page: 1, pageSize: 1000 });
  const rolesList = useResourceList('roles', { page: 1, pageSize: 1000 });
  const hostelsList = useResourceList('hostels', { page: 1, pageSize: 1000 });
  const transportList = useResourceList('transportRoutes', { page: 1, pageSize: 1000 });
  const libraryMastersList = useResourceList('libraryBooks', { page: 1, pageSize: 1000 });
  const coeMastersList = useResourceList('coeExamFormPreferences', { page: 1, pageSize: 1000 });
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
        teachers: teachersList.data?.items?.length ? teachersList.data.items : MASTER_DATA_FALLBACKS.teachers,
        employees: employeesList.data?.items?.length ? employeesList.data.items : MASTER_DATA_FALLBACKS.employees,
        departments: departmentsList.data?.items?.length ? departmentsList.data.items : MASTER_DATA_FALLBACKS.departments,
        courses: coursesList.data?.items?.length ? coursesList.data.items : MASTER_DATA_FALLBACKS.courses,
        academicSessions: academicSessionsList.data?.items?.length ? academicSessionsList.data.items : MASTER_DATA_FALLBACKS.academicSessions,
        semesters: semestersList.data?.items?.length ? semestersList.data.items : MASTER_DATA_FALLBACKS.semesters,
        sections: sectionsList.data?.items?.length ? sectionsList.data.items : MASTER_DATA_FALLBACKS.sections,
        subjects: subjectsList.data?.items?.length ? subjectsList.data.items : MASTER_DATA_FALLBACKS.subjects,
        feeHeads: feeHeadsList.data?.items?.length ? feeHeadsList.data.items : MASTER_DATA_FALLBACKS.feeHeads,
        feeCategories: feeCategoriesList.data?.items?.length ? feeCategoriesList.data.items : MASTER_DATA_FALLBACKS.feeCategories,
        feeHeadGroups: feeHeadGroupsList.data?.items?.length ? feeHeadGroupsList.data.items : MASTER_DATA_FALLBACKS.feeHeadGroups,
        installments: installmentsList.data?.items?.length ? installmentsList.data.items : MASTER_DATA_FALLBACKS.installments,
        users: usersList.data?.items?.length ? usersList.data.items : MASTER_DATA_FALLBACKS.users,
        roles: rolesList.data?.items?.length ? rolesList.data.items : MASTER_DATA_FALLBACKS.roles,
        hostels: hostelsList.data?.items?.length ? hostelsList.data.items : MASTER_DATA_FALLBACKS.hostels,
        transport: transportList.data?.items?.length ? transportList.data.items : MASTER_DATA_FALLBACKS.transport,
        libraryMasters: libraryMastersList.data?.items?.length ? libraryMastersList.data.items : MASTER_DATA_FALLBACKS.libraryMasters,
        coeMasters: coeMastersList.data?.items?.length ? coeMastersList.data.items : MASTER_DATA_FALLBACKS.coeMasters,
        timetables: timetablesList.data?.items || [],
        syllabi: syllabiList.data?.items || [],
        lectureNotes: lectureNotesList.data?.items || [],
        leads: leadsList.data?.items || [],
        colleges: collegesList.data?.items?.length ? collegesList.data.items : MASTER_DATA_FALLBACKS.colleges,

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

export function useMasterData() {
  return useERP();
}
