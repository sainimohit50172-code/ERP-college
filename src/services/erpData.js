export const departments = [
  { id: 'DEPT-CS', code: 'CS', name: 'Computer Science', head: 'Dr. Priya Menon', facultyCount: 34, activePrograms: 5, status: 'Active' },
  { id: 'DEPT-BA', code: 'BA', name: 'Business Administration', head: 'Dr. Karan Shah', facultyCount: 22, activePrograms: 4, status: 'Active' },
  { id: 'DEPT-MA', code: 'MA', name: 'Mathematics', head: 'Mr. Anil Kumar', facultyCount: 18, activePrograms: 3, status: 'Active' },
  { id: 'DEPT-EN', code: 'EN', name: 'English', head: 'Ms. Nisha Singh', facultyCount: 15, activePrograms: 3, status: 'Active' },
  { id: 'DEPT-BI', code: 'BI', name: 'Biology', head: 'Ms. Aditi Rao', facultyCount: 20, activePrograms: 4, status: 'Active' },
];

export const courses = [
  { id: 'COURSE-BCA', code: 'BCA-01', title: 'Bachelor of Computer Applications', departmentId: 'DEPT-CS', duration: '3 years', intake: 120, status: 'Active' },
  { id: 'COURSE-MBA', code: 'MGT-02', title: 'MBA in Marketing', departmentId: 'DEPT-BA', duration: '2 years', intake: 60, status: 'Active' },
  { id: 'COURSE-BSCBIO', code: 'BSC-03', title: 'BSc Biology', departmentId: 'DEPT-BI', duration: '3 years', intake: 80, status: 'Active' },
  { id: 'COURSE-BAENG', code: 'BAE-04', title: 'BA English Literature', departmentId: 'DEPT-EN', duration: '3 years', intake: 70, status: 'Active' },
  { id: 'COURSE-BSMATH', code: 'BMA-05', title: 'BSc Mathematics', departmentId: 'DEPT-MA', duration: '3 years', intake: 60, status: 'Active' },
];

export const semesters = [
  { id: 'SEM-BCA-1', code: 'SEM-101', title: 'Semester 1', courseId: 'COURSE-BCA', duration: 'Jun - Nov 2025', status: 'Open' },
  { id: 'SEM-BCA-2', code: 'SEM-102', title: 'Semester 2', courseId: 'COURSE-BCA', duration: 'Dec 2025 - May 2026', status: 'Planned' },
  { id: 'SEM-MBA-1', code: 'SEM-201', title: 'Semester 1', courseId: 'COURSE-MBA', duration: 'Jun - Nov 2025', status: 'Open' },
  { id: 'SEM-MBA-2', code: 'SEM-202', title: 'Semester 2', courseId: 'COURSE-MBA', duration: 'Dec 2025 - May 2026', status: 'Planned' },
  { id: 'SEM-BSCBIO-4', code: 'SEM-301', title: 'Semester 4', courseId: 'COURSE-BSCBIO', duration: 'Jun - Nov 2025', status: 'Open' },
];

export const sections = [
  { id: 'SEC-BCA-5-A', name: 'BCA-5-A', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', capacity: 60, enrolled: 58, advisorId: 'TEA-001', status: 'Active' },
  { id: 'SEC-BCA-5-B', name: 'BCA-5-B', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', capacity: 60, enrolled: 55, advisorId: 'TEA-002', status: 'Active' },
  { id: 'SEC-MBA-2-A', name: 'MBA-2-A', courseId: 'COURSE-MBA', semesterId: 'SEM-MBA-1', capacity: 45, enrolled: 43, advisorId: 'TEA-004', status: 'Active' },
  { id: 'SEC-BSC-4-A', name: 'BScBIO-4-A', courseId: 'COURSE-BSCBIO', semesterId: 'SEM-BSCBIO-4', capacity: 50, enrolled: 48, advisorId: 'TEA-005', status: 'Active' },
  { id: 'SEC-BA-1-A', name: 'BAENG-1-A', courseId: 'COURSE-BAENG', semesterId: 'SEM-MBA-1', capacity: 65, enrolled: 62, advisorId: 'TEA-003', status: 'Active' },
];

export const teachers = [
  { id: 'TEA-001', name: 'Dr. Priya Menon', email: 'priya.menon@enterprise.edu', departmentId: 'DEPT-CS', designation: 'Professor', status: 'Active' },
  { id: 'TEA-002', name: 'Dr. Anil Kumar', email: 'anil.kumar@enterprise.edu', departmentId: 'DEPT-CS', designation: 'Associate Professor', status: 'Active' },
  { id: 'TEA-003', name: 'Ms. Nisha Singh', email: 'nisha.singh@enterprise.edu', departmentId: 'DEPT-EN', designation: 'Senior Lecturer', status: 'Active' },
  { id: 'TEA-004', name: 'Dr. Karan Shah', email: 'karan.shah@enterprise.edu', departmentId: 'DEPT-BA', designation: 'Professor', status: 'Active' },
  { id: 'TEA-005', name: 'Ms. Aditi Rao', email: 'aditi.rao@enterprise.edu', departmentId: 'DEPT-BI', designation: 'Assistant Professor', status: 'Active' },
];

export const students = [
  { id: 'STU-1001', enrollmentNo: 'ERP-2025-001', name: 'Aarav Sharma', email: 'aarav.sharma@student.enterprise.edu', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', departmentId: 'DEPT-CS', status: 'Active', admissionDate: '2025-06-05', feeStatus: 'Paid', balance: 0, rollNo: 'BCA501' },
  { id: 'STU-1002', enrollmentNo: 'ERP-2025-002', name: 'Sara Mehta', email: 'sara.mehta@student.enterprise.edu', courseId: 'COURSE-BAENG', semesterId: 'SEM-MBA-1', sectionId: 'SEC-BA-1-A', departmentId: 'DEPT-EN', status: 'Active', admissionDate: '2025-08-12', feeStatus: 'Pending', balance: 2200, rollNo: 'ENG103' },
  { id: 'STU-1003', enrollmentNo: 'ERP-2025-003', name: 'Neel Patel', email: 'neel.patel@student.enterprise.edu', courseId: 'COURSE-BSCBIO', semesterId: 'SEM-BSCBIO-4', sectionId: 'SEC-BSC-4-A', departmentId: 'DEPT-BI', status: 'Active', admissionDate: '2025-07-29', feeStatus: 'Partial', balance: 1800, rollNo: 'BIO404' },
];

export const subjects = [
  { id: 'SUB-CS201', code: 'CS201', title: 'Data Structures', departmentId: 'DEPT-CS', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', credits: 4, status: 'Active' },
  { id: 'SUB-CS202', code: 'CS202', title: 'Database Management', departmentId: 'DEPT-CS', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', credits: 4, status: 'Active' },
  { id: 'SUB-EN101', code: 'EN101', title: 'English Composition', departmentId: 'DEPT-EN', courseId: 'COURSE-BAENG', semesterId: 'SEM-MBA-1', credits: 3, status: 'Active' },
  { id: 'SUB-MA203', code: 'MA203', title: 'Calculus II', departmentId: 'DEPT-MA', courseId: 'COURSE-BSMATH', semesterId: 'SEM-MBA-1', credits: 3, status: 'Active' },
  { id: 'SUB-BI401', code: 'BI401', title: 'Genetics', departmentId: 'DEPT-BI', courseId: 'COURSE-BSCBIO', semesterId: 'SEM-BSCBIO-4', credits: 3, status: 'Active' },
];

export const subjectAssignments = subjects.map((subject, index) => ({
  id: `SA-${100 + index}`,
  subjectId: subject.id,
  courseId: subject.courseId,
  semesterId: subject.semesterId,
  credits: subject.credits,
  practicalHours: subject.courseId === 'COURSE-BCA' ? 2 : 1,
  isCore: true,
  status: 'Active',
}));

export const teacherSubjectAssignments = [
  { id: 'TSA-001', teacherId: 'TEA-001', subjectId: 'SUB-CS201', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', theoryHours: 48, practicalHours: 24, totalHours: 72, status: 'Active' },
  { id: 'TSA-002', teacherId: 'TEA-002', subjectId: 'SUB-CS202', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', theoryHours: 44, practicalHours: 28, totalHours: 72, status: 'Active' },
  { id: 'TSA-003', teacherId: 'TEA-003', subjectId: 'SUB-EN101', courseId: 'COURSE-BAENG', semesterId: 'SEM-MBA-1', theoryHours: 40, practicalHours: 0, totalHours: 40, status: 'Active' },
  { id: 'TSA-004', teacherId: 'TEA-004', subjectId: 'SUB-BI401', courseId: 'COURSE-BSCBIO', semesterId: 'SEM-BSCBIO-4', theoryHours: 38, practicalHours: 20, totalHours: 58, status: 'Active' },
];

export const teacherSemesterAssignments = [
  { id: 'TSA-SEM-001', teacherId: 'TEA-001', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', theoryHours: 48, practicalHours: 24, totalHours: 72, status: 'Active' },
  { id: 'TSA-SEM-002', teacherId: 'TEA-002', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-B', theoryHours: 48, practicalHours: 24, totalHours: 72, status: 'Active' },
  { id: 'TSA-SEM-003', teacherId: 'TEA-004', courseId: 'COURSE-MBA', semesterId: 'SEM-MBA-1', sectionId: 'SEC-MBA-2-A', theoryHours: 44, practicalHours: 20, totalHours: 64, status: 'Active' },
];

export const lectureSchedules = [
  { id: 'LCE-001', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', subjectId: 'SUB-CS201', teacherId: 'TEA-001', room: 'A-301', day: 'Monday', time: '09:00 - 10:30', type: 'Theory', status: 'Confirmed' },
  { id: 'LCE-002', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', subjectId: 'SUB-CS202', teacherId: 'TEA-002', room: 'A-305', day: 'Monday', time: '10:45 - 12:15', type: 'Practical', status: 'Confirmed' },
  { id: 'LCE-003', courseId: 'COURSE-MBA', semesterId: 'SEM-MBA-1', sectionId: 'SEC-MBA-2-A', subjectId: 'SUB-BI401', teacherId: 'TEA-004', room: 'B-204', day: 'Tuesday', time: '11:00 - 12:30', type: 'Theory', status: 'Confirmed' },
  { id: 'LCE-004', courseId: 'COURSE-BAENG', semesterId: 'SEM-MBA-1', sectionId: 'SEC-BA-1-A', subjectId: 'SUB-EN101', teacherId: 'TEA-003', room: 'C-102', day: 'Wednesday', time: '13:00 - 14:30', type: 'Theory', status: 'Confirmed' },
];

export const classrooms = [
  { id: 'CR-001', roomNumber: 'A-101', building: 'Academic Block A', capacity: 60, hasProjector: true, hasLab: false, hasAC: true, floor: '1', status: 'Active' },
  { id: 'CR-002', roomNumber: 'A-102', building: 'Academic Block A', capacity: 60, hasProjector: true, hasLab: false, hasAC: true, floor: '1', status: 'Active' },
  { id: 'CR-003', roomNumber: 'A-201', building: 'Academic Block A', capacity: 45, hasProjector: true, hasLab: false, hasAC: true, floor: '2', status: 'Active' },
  { id: 'CR-004', roomNumber: 'B-Lab-01', building: 'Lab Block', capacity: 40, hasProjector: false, hasLab: true, hasAC: true, floor: '1', status: 'Active' },
  { id: 'CR-005', roomNumber: 'C-101', building: 'Academic Block C', capacity: 80, hasProjector: true, hasLab: false, hasAC: true, floor: '1', status: 'Maintenance' },
];

export const calendarEvents = [
  { id: 'EVT-001', event: 'Semester 5 Classes Begin', startDate: '2025-07-01', endDate: '2025-07-01', eventType: 'Session Start', status: 'Scheduled' },
  { id: 'EVT-002', event: 'Mid Semester Exam', startDate: '2025-09-10', endDate: '2025-09-20', eventType: 'Examination', status: 'Scheduled' },
  { id: 'EVT-003', event: 'Summer Break', startDate: '2025-05-15', endDate: '2025-06-30', eventType: 'Holiday', status: 'Completed' },
  { id: 'EVT-004', event: 'Internal Assessment 1', startDate: '2025-08-20', endDate: '2025-08-25', eventType: 'Assessment', status: 'Scheduled' },
  { id: 'EVT-005', event: 'End Semester Exam', startDate: '2025-11-15', endDate: '2025-11-30', eventType: 'Examination', status: 'Scheduled' },
];

export const timetables = [
  { id: 'TG-001', course: 'BCA-01', semester: 'Semester 1', section: 'A', generatedDate: '2025-05-20', totalSlots: 35, conflicts: 0, status: 'Active', conflictResolution: 'Auto' },
  { id: 'TG-002', course: 'BCA-01', semester: 'Semester 1', section: 'B', generatedDate: '2025-05-20', totalSlots: 35, conflicts: 0, status: 'Active', conflictResolution: 'Auto' },
  { id: 'TG-003', course: 'MGT-02', semester: 'Semester 2', section: 'A', generatedDate: '2025-05-19', totalSlots: 28, conflicts: 2, status: 'Needs Review', conflictResolution: 'Manual' },
  { id: 'TG-004', course: 'BSC-03', semester: 'Semester 4', section: 'A', generatedDate: '2025-05-18', totalSlots: 32, conflicts: 0, status: 'Active', conflictResolution: 'Auto' },
  { id: 'TG-005', course: 'BAE-04', semester: 'Semester 1', section: 'A', generatedDate: '2025-05-17', totalSlots: 25, conflicts: 1, status: 'Needs Review', conflictResolution: 'Manual' },
];

export const teacherCourseAssignments = [
  { id: 'TCA-001', teacherId: 'TEA-001', teacher: 'Dr. Priya Menon', course: 'BCA-01', semester: 'Semester 1', subjects: 2, credits: 8, prerequisite: 'None', yearsTeaching: 5, status: 'Active' },
  { id: 'TCA-002', teacherId: 'TEA-002', teacher: 'Dr. Anil Kumar', course: 'BCA-01', semester: 'Semester 1', subjects: 2, credits: 8, prerequisite: 'None', yearsTeaching: 7, status: 'Active' },
  { id: 'TCA-003', teacherId: 'TEA-003', teacher: 'Ms. Nisha Singh', course: 'BCA-01', semester: 'Semester 1', subjects: 3, credits: 12, prerequisite: 'Programming fundamentals', yearsTeaching: 4, status: 'Active' },
  { id: 'TCA-004', teacherId: 'TEA-004', teacher: 'Dr. Karan Shah', course: 'MGT-02', semester: 'Semester 2', subjects: 2, credits: 8, prerequisite: 'Business Management', yearsTeaching: 8, status: 'Active' },
  { id: 'TCA-005', teacherId: 'TEA-005', teacher: 'Ms. Aditi Rao', course: 'BSC-03', semester: 'Semester 4', subjects: 2, credits: 8, prerequisite: 'Biology basics', yearsTeaching: 6, status: 'Active' },
];

export const studentAttendance = [
  { id: 'ATT-STU-001', studentId: 'STU-1001', date: '2025-05-15', status: 'Present', courseId: 'COURSE-BCA', sectionId: 'SEC-BCA-5-A' },
  { id: 'ATT-STU-002', studentId: 'STU-1002', date: '2025-05-15', status: 'Present', courseId: 'COURSE-BAENG', sectionId: 'SEC-BA-1-A' },
  { id: 'ATT-STU-003', studentId: 'STU-1003', date: '2025-05-15', status: 'Absent', courseId: 'COURSE-BSCBIO', sectionId: 'SEC-BSC-4-A' },
];

export const lectureAttendance = [
  { id: 'ATT-LCE-001', scheduleId: 'LCE-001', date: '2025-05-15', present: 55, absent: 2, late: 1, percentage: 94.8, status: 'Completed' },
  { id: 'ATT-LCE-002', scheduleId: 'LCE-002', date: '2025-05-15', present: 56, absent: 1, late: 1, percentage: 96.6, status: 'Completed' },
];

export const lectureNotes = [
  { id: 'LN-001', subjectId: 'SUB-CS201', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', title: 'Data Structures - Trees', uploadedById: 'TEA-001', uploadedOn: '2025-05-12', status: 'Published', downloads: 132 },
  { id: 'LN-002', subjectId: 'SUB-CS202', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', title: 'Database Normalization', uploadedById: 'TEA-002', uploadedOn: '2025-05-10', status: 'Published', downloads: 98 },
];

export const syllabi = [
  { id: 'SYL-001', subjectId: 'SUB-CS201', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', title: 'Data Structures Syllabus', version: '1.0', topics: 12, uploadedById: 'TEA-001', uploadedOn: '2025-05-01', status: 'Approved' },
  { id: 'SYL-002', subjectId: 'SUB-CS202', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', title: 'Database Management Syllabus', version: '1.0', topics: 10, uploadedById: 'TEA-002', uploadedOn: '2025-05-03', status: 'Approved' },
];

export const assignments = [
  { id: 'ASGN-001', title: 'Heap Implementation', subjectId: 'SUB-CS201', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', assignedById: 'TEA-001', dueDate: '2025-05-22', submissionCount: 56, maxScore: 100, status: 'Open' },
  { id: 'ASGN-002', title: 'ER Diagram Submission', subjectId: 'SUB-CS202', courseId: 'COURSE-BCA', semesterId: 'SEM-BCA-1', sectionId: 'SEC-BCA-5-A', assignedById: 'TEA-002', dueDate: '2025-05-24', submissionCount: 55, maxScore: 100, status: 'Open' },
];

export const internalMarks = [
  { id: 'IM-001', studentId: 'STU-1001', subjectId: 'SUB-CS201', assignment1: 12, assignment2: 13, midTerm: 18, presentation: 7, total: 50, percentage: 100 },
  { id: 'IM-002', studentId: 'STU-1002', subjectId: 'SUB-EN101', assignment1: 11, assignment2: 12, midTerm: 17, presentation: 8, total: 48, percentage: 96 },
];

export const results = [
  { id: 'RES-001', studentId: 'STU-1001', subjectId: 'SUB-CS201', internalMarks: 50, practicalMarks: 45, externalMarks: 85, total: 180, percentage: 90, grade: 'A', status: 'Published' },
  { id: 'RES-002', studentId: 'STU-1002', subjectId: 'SUB-EN101', internalMarks: 48, practicalMarks: 0, externalMarks: 80, total: 128, percentage: 85, grade: 'A', status: 'Published' },
];

export const leads = [
  { id: 'LEAD-001', name: 'Aditi Sharma', source: 'Website', assignedToId: 'EMP-001', courseId: 'COURSE-BCA', status: 'Follow-up', stage: 'Counsellor', followUps: 3, expectedConversion: 'High' },
  { id: 'LEAD-002', name: 'Rahul Verma', source: 'Referral', assignedToId: 'EMP-002', courseId: 'COURSE-MBA', status: 'New', stage: 'Telecaller', followUps: 1, expectedConversion: 'Medium' },
  { id: 'LEAD-003', name: 'Sana Iqbal', source: 'Social Media', assignedToId: 'EMP-001', courseId: 'COURSE-BSCBIO', status: 'Admission Confirmed', stage: 'Counsellor', followUps: 5, expectedConversion: 'Confirmed' },
];

export const employees = [
  { id: 'EMP-001', name: 'Priya Roy', email: 'priya.roy@enterprise.edu', department: 'Admissions', designation: 'Senior Counsellor', status: 'Active' },
  { id: 'EMP-002', name: 'Rajiv Menon', email: 'rajiv.menon@enterprise.edu', department: 'CRM', designation: 'Telecaller', status: 'Active' },
  { id: 'EMP-003', name: 'Smita Nair', email: 'smita.nair@enterprise.edu', department: 'Finance', designation: 'Accounts Executive', status: 'Active' },
];

export const employeeAttendance = [
  { id: 'EMP-ATT-001', employeeId: 'EMP-001', date: '2025-05-15', shift: 'Morning', status: 'Present' },
  { id: 'EMP-ATT-002', employeeId: 'EMP-002', date: '2025-05-15', shift: 'Morning', status: 'Present' },
  { id: 'EMP-ATT-003', employeeId: 'EMP-003', date: '2025-05-15', shift: 'Morning', status: 'Present' },
];

export const feePayments = [
  { id: 'PAY-001', studentId: 'STU-1001', amount: 15000, date: '2025-05-05', method: 'Online', status: 'Paid' },
  { id: 'PAY-002', studentId: 'STU-1002', amount: 13000, date: '2025-05-10', method: 'Cash', status: 'Pending' },
];

export const notifications = [
  { id: 'NOTIF-001', title: 'New lead assigned to Admissions team', details: 'Rahul Verma assigned to Rajiv Menon', date: '2025-05-15' },
  { id: 'NOTIF-002', title: 'Lecture notes published for Data Structures', details: 'Dr. Priya Menon uploaded new notes', date: '2025-05-14' },
];
