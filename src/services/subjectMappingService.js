let _store = null;

function generateDemoMappings(count = 60) {
  const colleges = [
    'Roorkee College of Agricultural Sciences',
    'Roorkee College of Allied Health Sciences',
    'Roorkee College of Business Studies',
    'Roorkee College of Engineering',
    'Roorkee College of Smart Computing',
  ];
  const courses = [
    'B.Sc. Computer Science (Data Science)',
    'B.Tech. Hons. CSE',
    'BCA',
    'B.Com',
    'BBA',
  ];
  const semesters = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
  const sections = ['A','B','C','D'];

  const subjectPool = [
    'Data Structures','Operating System','Database Management System','Computer Networks','Object Oriented Programming','Software Engineering','Discrete Mathematics','Compiler Design','Machine Learning','Cloud Computing','Cyber Security','Human Computer Interaction','Artificial Intelligence'
  ];

  const facultyPool = [
    'Dr. Asha Verma','Mr. Vinay Pant','Ms. Priya Singh','Mr. Rohit Kumar','Ms. Anita Sharma','Mr. Suresh Tiwari','Ms. Kavita Joshi','Mr. Aman Verma','Ms. Sonal Gupta'
  ];

  const rows = [];
  for (let i = 0; i < count; i++) {
    const college = colleges[i % colleges.length];
    const course = courses[i % courses.length];
    const semester = semesters[i % semesters.length];
    const section = sections[i % sections.length];

    const subjects = [];
    const subjectCount = 3 + (i % 6);
    for (let s = 0; s < subjectCount; s++) {
      const subj = subjectPool[(i + s) % subjectPool.length] + (s > 0 && Math.random() > 0.6 ? ' Practical' : '');
      const fac = facultyPool[(i + s) % facultyPool.length];
      subjects.push({ id: `${i+1}-${s+1}`, subject: subj, name: subj, faculty: fac, assessment: 'MAJOR', mode: s % 2 === 0 ? 'theory' : 'practical', type: 'GENERAL', sequence: s+1, count: 5, displayName: subj, visible: true });
    }

    rows.push({ id: i + 1, college, course, semester, section, coordinator: facultyPool[i % facultyPool.length], collegeTeacher: facultyPool[(i+1) % facultyPool.length], subjects });
  }

  _store = { rows, colleges, courses, semesters, sections };
  return _store;
}

function ensureStore() {
  if (!_store) generateDemoMappings(60);
  return _store;
}

export function listMappings() {
  return ensureStore().rows.slice();
}

export function getMapping(id) {
  const s = ensureStore();
  return s.rows.find((r) => String(r.id) === String(id)) || null;
}

export function updateMapping(id, data) {
  const s = ensureStore();
  const idx = s.rows.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return false;
  s.rows[idx] = { ...s.rows[idx], ...data };
  return true;
}

export function deleteMapping(id) {
  const s = ensureStore();
  const idx = s.rows.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return false;
  s.rows.splice(idx, 1);
  return true;
}

export function addSubjectToMapping(mappingId, subject) {
  const mapping = getMapping(mappingId);
  if (!mapping) return false;
  mapping.subjects.push(subject);
  return true;
}

export default { generateDemoMappings, listMappings, getMapping, updateMapping, deleteMapping, addSubjectToMapping };
