export const collegeOptions = [
  'Roorkee College of Agricultural Sciences',
  'Roorkee College of Allied Health Sciences',
  'Roorkee College of Business Studies',
  'Roorkee College of Engineering',
  'Roorkee College of Smart Computing',
];

export const courseOptions = [
  'B.Sc. Computer Science (Data Science)',
  'B.Tech. Hons. CSE',
  'BCA',
  'B.Com',
  'BBA',
  'B.Sc. Nursing',
  'MCA',
  'M.Sc. Physics',
];

export const semesterOptions = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6', 'Sem 7', 'Sem 8'];
export const sectionOptions = ['A', 'B', 'C', 'D'];

export const coordinatorOptions = [
  'Vinay Kumar Pant-HU156',
  'Asha Verma-HU101',
  'Rohit Singh-HU102',
  'Priya Sharma-HU103',
  'Anjali Gupta-HU104',
  'Sonal Joshi-HU105',
  'Aman Verma-HU106',
];

export const teacherOptions = [
  'Akanksha Shukla-HU151',
  'Pooja Malhotra-HU153',
  'Rohit Kumar-HU154',
  'Himanshu Verma-HU155',
  'Vikram Singh-HU157',
  'Neha Raj-HU158',
  'Suresh Patel-HU159',
  'Anita Sharma-HU160',
  'Manish Kapoor-HU161',
  'Megha Nair-HU162',
];

export const subjectOptions = [
  'Operating Systems',
  'Database Management System',
  'Fundamentals of AI and ML',
  'Data Structures',
  'Computer Networks',
  'Object Oriented Programming',
  'Software Engineering',
  'Discrete Mathematics',
  'Compiler Design',
  'Cyber Security',
  'Cloud Computing',
  'Human Computer Interaction',
  'Artificial Intelligence',
  'Machine Learning',
];

export const assessmentModelOptions = [
  'SCHOLASTIC',
  'CO-SCHOLASTIC',
  'DISCIPLINE',
  'SKILL',
  'MAJOR',
  'MINOR',
  'MDC',
  'SEC',
  'VAC',
  'AEC',
  'VOC',
].map((value) => ({ value, label: value }));

export const subjectModeOptions = [
  { value: 'theory', label: 'Theory' },
  { value: 'practical', label: 'Practical' },
];

export const subjectTypeOptions = [
  { value: 'GENERAL', label: 'GENERAL' },
  { value: 'LAB', label: 'LAB' },
  { value: 'PROJECT', label: 'PROJECT' },
  { value: 'TUTORIAL', label: 'TUTORIAL' },
  { value: 'PRACTICAL', label: 'PRACTICAL' },
  { value: 'SEMINAR', label: 'SEMINAR' },
  { value: 'WORKSHOP', label: 'WORKSHOP' },
];

export const teacherSelectOptions = teacherOptions.map((value) => ({ value, label: value }));
export const coordinatorSelectOptions = coordinatorOptions.map((value) => ({ value, label: value }));
export const subjectSelectOptions = subjectOptions.map((value) => ({ value, label: value }));
export const collegeSelectOptions = collegeOptions.map((value) => ({ value, label: value }));
export const courseSelectOptions = courseOptions.map((value) => ({ value, label: value }));
export const semesterSelectOptions = semesterOptions.map((value) => ({ value, label: value }));
export const sectionSelectOptions = sectionOptions.map((value) => ({ value, label: value }));
