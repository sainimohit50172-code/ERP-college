const mockAllocations = [
  {
    id: 1,
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech CSE',
    semester: 'Semester 3',
    section: 'Section A',
    subject: 'Operating System',
    subjectCode: 'CS301',
    faculty: 'Narayan Jee',
    status: 'Allocated',
    academicYear: '2025-26',
    createdDate: '2025-07-01',
    updatedDate: '2025-07-10',
  },
  {
    id: 2,
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech CSE',
    semester: 'Semester 5',
    section: 'Section B',
    subject: 'Database Management System',
    subjectCode: 'CS302',
    faculty: 'Ankita Singh',
    status: 'Allocated',
    academicYear: '2025-26',
    createdDate: '2025-06-20',
    updatedDate: '2025-07-08',
  },
  {
    id: 3,
    college: 'Roorkee College of Engineering',
    course: 'BCA',
    semester: 'Semester 3',
    section: 'Section A',
    subject: 'Web Development',
    subjectCode: 'CA305',
    faculty: 'Ravi Kumar',
    status: 'Pending',
    academicYear: '2025-26',
    createdDate: '2025-06-15',
    updatedDate: '2025-06-25',
  },
  {
    id: 4,
    college: 'Roorkee College of Pharmacy',
    course: 'B.Pharm',
    semester: 'Semester 4',
    section: 'Section B',
    subject: 'Pharmacology',
    subjectCode: 'PH402',
    faculty: 'Dr. Meera Gupta',
    status: 'Allocated',
    academicYear: '2025-26',
    createdDate: '2025-05-18',
    updatedDate: '2025-06-01',
  },
  {
    id: 5,
    college: 'Roorkee College of Management',
    course: 'MBA',
    semester: 'Semester 1',
    section: 'Section C',
    subject: 'Business Analytics',
    subjectCode: 'MB101',
    faculty: 'Pooja Sharma',
    status: 'Allocated',
    academicYear: '2025-26',
    createdDate: '2025-06-10',
    updatedDate: '2025-06-30',
  },
];

const delay = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const clone = (item) => JSON.parse(JSON.stringify(item));

export async function getAllocationsByCollege(college) {
  await delay(500);
  if (!college) return [];
  return mockAllocations.filter((item) => item.college === college).map(clone);
}

export async function createAllocation(payload) {
  await delay(400);
  const allocation = {
    id: Date.now(),
    college: payload.college,
    course: payload.course,
    semester: payload.semester,
    section: payload.section,
    subject: payload.subject,
    subjectCode: payload.subjectCode,
    faculty: payload.faculty,
    status: payload.status || 'Allocated',
    academicYear: payload.academicYear || '2025-26',
    createdDate: payload.createdDate || new Date().toISOString().slice(0, 10),
    updatedDate: payload.updatedDate || new Date().toISOString().slice(0, 10),
  };
  mockAllocations.push(allocation);
  return clone(allocation);
}

export async function updateAllocation(id, payload) {
  await delay(400);
  const index = mockAllocations.findIndex((item) => item.id === Number(id));
  if (index === -1) throw new Error('Allocation not found');

  const updated = {
    ...mockAllocations[index],
    ...payload,
    id: Number(id),
    updatedDate: new Date().toISOString().slice(0, 10),
  };
  mockAllocations[index] = updated;
  return clone(updated);
}

export async function deleteAllocation(id) {
  await delay(300);
  const index = mockAllocations.findIndex((item) => item.id === Number(id));
  if (index === -1) throw new Error('Allocation not found');

  const [removed] = mockAllocations.splice(index, 1);
  return clone(removed);
}

export default {
  getAllocationsByCollege,
  createAllocation,
  updateAllocation,
  deleteAllocation,
};
