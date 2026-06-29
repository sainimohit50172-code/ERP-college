import api from './axios.js';
import {
  students,
  teachers,
  departments,
  courses,
  subjects,
  leads,
  employees,
  studentAttendance,
  feePayments,
} from '../services/erpData.js';

const inventoryItems = [
  { id: 'INV-001', title: 'Dell Latitude 7440 Laptop', description: 'Computer Science lab asset', metadata: 'Serial SN-9743' },
  { id: 'INV-002', title: 'Epson Projector', description: 'Lecture hall A-301', metadata: 'Model: EB-X41' },
  { id: 'INV-003', title: 'Cisco Switch', description: 'Network equipment, server room', metadata: '48-port, managed' },
  { id: 'INV-004', title: 'Whiteboard set', description: 'Classroom kit for B-204', metadata: '56 x 42 inches' },
];

const transportItems = [
  { id: 'TR-001', title: 'Blue College Bus', description: 'Route 12: North Campus', metadata: 'Driver: Ramesh' },
  { id: 'TR-002', title: 'White Shuttle Van', description: 'Route 4: City Center', metadata: 'Driver: Sanjay' },
  { id: 'TR-003', title: 'Green Mini-Bus', description: 'Hostel transfers', metadata: 'Capacity 22' },
];

const hostelItems = [
  { id: 'HS-001', title: 'Maple Hostel', description: 'Girls hostel block', metadata: 'Capacity 180' },
  { id: 'HS-002', title: 'Oak Hostel', description: 'Boys hostel block', metadata: 'Capacity 210' },
  { id: 'HS-003', title: 'Pine Guest Wing', description: 'Visitors and short stays', metadata: 'Capacity 40' },
];

const libraryItems = [
  { id: 'LB-001', title: 'Data Structures', description: 'Textbook by Seymour Lipschutz', metadata: 'Shelf B-12' },
  { id: 'LB-002', title: 'Database Management Systems', description: 'Book by Raghu Ramakrishnan', metadata: 'Shelf B-08' },
  { id: 'LB-003', title: 'Campus Regulations', description: 'Policy handbook', metadata: 'Shelf A-01' },
];

const examItems = [
  { id: 'EX-001', title: 'End Semester Exam', description: 'BCA Semester 1', metadata: 'Nov 2025' },
  { id: 'EX-002', title: 'Internal Assessment 1', description: 'MBA Semester 1', metadata: 'Aug 2025' },
  { id: 'EX-003', title: 'Practical Lab Exam', description: 'Biology lab', metadata: 'Sep 2025' },
];

const sources = [
  {
    category: 'Students',
    route: '/students',
    items: students,
    fields: ['name', 'enrollmentNo', 'email', 'rollNo', 'status'],
    getTitle: (item) => item.name,
    getDescription: (item) => `${item.courseId || '—'} • ${item.status || 'Active'}`,
  },
  {
    category: 'Faculty',
    route: '/teachers',
    items: teachers,
    fields: ['name', 'email', 'designation', 'status'],
    getTitle: (item) => item.name,
    getDescription: (item) => `${item.designation || ''} • ${item.departmentId || ''}`,
  },
  {
    category: 'Employees',
    route: '/employees',
    items: employees,
    fields: ['name', 'email', 'department', 'designation', 'status'],
    getTitle: (item) => item.name,
    getDescription: (item) => `${item.designation || ''} • ${item.department || ''}`,
  },
  {
    category: 'Departments',
    route: '/departments',
    items: departments,
    fields: ['name', 'code', 'head', 'status'],
    getTitle: (item) => item.name,
    getDescription: (item) => `${item.code || ''} • Head: ${item.head || 'TBD'}`,
  },
  {
    category: 'Courses',
    route: '/courses',
    items: courses,
    fields: ['title', 'code', 'duration', 'status'],
    getTitle: (item) => item.title,
    getDescription: (item) => `${item.code || ''} • ${item.duration || ''}`,
  },
  {
    category: 'Subjects',
    route: '/subjects',
    items: subjects,
    fields: ['title', 'code', 'status'],
    getTitle: (item) => item.title,
    getDescription: (item) => `${item.code || ''} • ${item.status || ''}`,
  },
  {
    category: 'Admissions',
    route: '/admissions',
    items: leads,
    fields: ['name', 'source', 'status', 'stage', 'expectedConversion'],
    getTitle: (item) => item.name,
    getDescription: (item) => `${item.courseId || ''} • ${item.stage || item.status || ''}`,
  },
  {
    category: 'Attendance',
    route: '/attendance',
    items: studentAttendance,
    fields: ['studentId', 'date', 'status', 'courseId', 'sectionId'],
    getTitle: (item) => `${item.studentId} • ${item.date}`,
    getDescription: (item) => `${item.status || ''} • ${item.courseId || ''}`,
  },
  {
    category: 'Fees',
    route: '/students',
    items: feePayments,
    fields: ['id', 'status', 'method', 'date', 'amount'],
    getTitle: (item) => `Payment ${item.id}`,
    getDescription: (item) => `${item.method || ''} • ${item.status || ''}`,
  },
  {
    category: 'Examination',
    route: '/examination',
    items: examItems,
    fields: ['title', 'description', 'metadata'],
    getTitle: (item) => item.title,
    getDescription: (item) => item.description,
  },
  {
    category: 'Inventory',
    route: '/inventory',
    items: inventoryItems,
    fields: ['title', 'description', 'metadata'],
    getTitle: (item) => item.title,
    getDescription: (item) => item.description,
  },
  {
    category: 'Transport',
    route: '/transport',
    items: transportItems,
    fields: ['title', 'description', 'metadata'],
    getTitle: (item) => item.title,
    getDescription: (item) => item.description,
  },
  {
    category: 'Hostel',
    route: '/hostel',
    items: hostelItems,
    fields: ['title', 'description', 'metadata'],
    getTitle: (item) => item.title,
    getDescription: (item) => item.description,
  },
  {
    category: 'Library',
    route: '/library',
    items: libraryItems,
    fields: ['title', 'description', 'metadata'],
    getTitle: (item) => item.title,
    getDescription: (item) => item.description,
  },
];

const matchRecord = (item, fields, term) =>
  fields.some((field) => String(item[field] ?? '').toLowerCase().includes(term));

const createSearchResult = (category, route, item, getTitle, getDescription) => ({
  id: `${category}-${item.id}`,
  category,
  route,
  title: getTitle(item),
  description: getDescription(item),
});

const searchMock = (query) => {
  const term = String(query || '').trim().toLowerCase();
  if (!term) return [];
  const results = [];

  sources.forEach(({ category, route, items, fields, getTitle, getDescription }) => {
    items.forEach((item) => {
      if (matchRecord(item, fields, term)) {
        results.push(createSearchResult(category, route, item, getTitle, getDescription));
      }
    });
  });

  return results.slice(0, 20);
};

export async function searchAll(query) {
  const text = String(query || '').trim();
  if (!text) return [];

  try {
    const response = await api.get('/search', { params: { q: text } });
    if (Array.isArray(response?.data)) {
      return response.data;
    }
  } catch {
    // fall back to local mock data when backend search is not available.
  }

  return searchMock(text);
}

export default {
  searchAll,
};
