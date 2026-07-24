const colleges = [
  'Roorkee College of Agricultural Sciences',
  'Roorkee College of Allied Health Sciences',
  'Roorkee College of Business Studies',
  'Roorkee College of Engineering',
  'Roorkee College of Smart Computing',
];

const courses = [
  'B.Com',
  'B.Pharmacy',
  'B.Pharmacy LE',
  'B.Sc. Agriculture Hons.',
  'B.Sc. Computer Science (Data Science)',
  'B.Sc. Nursing',
  'B.Tech Hons. LE - ECE',
  'B.Tech. Hons. AI-ML',
  'B.Tech. Hons. CE',
  'B.Tech. Hons. CSE',
  'B.Tech. Hons. CSE (IOT)',
  'B.Tech. Hons. Cyber Security',
  'B.Tech. Hons. Data Science',
  'B.Tech. Hons. ECE',
  'B.Tech. Hons. EEE',
  'B.Tech. Hons. ME',
  'BACHELOR OF TECHNOLOGY(HONOURS) (COMPUTER SCIENCE AND ENGINEERING) (LATERAL ENTRY)',
  'BACHELOR OF TECHNOLOGY(HONOURS) (COMPUTER SCIENCE AND ENGINERRING - ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING) (LATERAL ENTRY)',
  'BBA',
  'BCA',
  'BCA AI-ML',
  'BCA Cyber Security',
  'BCA Data Science',
  'D.Pharmacy',
  'M.Pharmacy Pharmaceutics',
  'M.Sc. Agriculture',
  'M.Sc. Agriculture (With Agronomy)',
  'M.Sc. Agriculture (With Plant Pathology)',
  'M.Sc. Microbiology',
  'M.Tech. CE',
  'M.Tech. CS',
  'M.Tech. CSE',
  'M.Tech. ECE',
  'M.Tech. EEE',
  'M.Tech. ME',
  'MBA',
  'MBA (IIM Certification)',
  'MCA',
  'Ph.D. (Agriculture)',
  'Ph.D. (Management)',
  'Ph.D. CE',
  'Ph.D. CS',
  'Ph.D. CSE',
  'Ph.D. ECE',
  'Ph.D. EEE',
  'Ph.D. ME',
];

const semesters = ['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6','Sem 7','Sem 8'];
const sections = ['A','B','C','D'];

const assessmentModels = ['Major','Minor','Model'];
const modes = ['theory','practical'];
const types = ['GENERAL','ELECTIVE'];

function rand(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

function makeSubject(id){
  return {
    id: `${id}-s-${Math.floor(Math.random()*9999)}`,
    name: ['Data Structures','Operating System Practical','Database Systems','Algorithms','Computer Networks','Software Engineering'][Math.floor(Math.random()*6)],
    teacher: ['Dr. Asha Verma','Mr. Vinay Pant','Ms. S. Rao','Dr. R. Kumar'][Math.floor(Math.random()*4)],
    assessmentModel: rand(assessmentModels),
    mode: rand(modes),
    type: rand(types),
    sequence: Math.floor(Math.random()*6)+1,
  };
}

let store = null;

function build(n = 60){
  const out = [];
  for(let i=0;i<n;i++){
    const college = rand(colleges);
    const course = rand(courses);
    const semester = rand(semesters);
    const section = rand(sections);
    const subjectsCount = 5 + Math.floor(Math.random()*6);
    const subjects = Array.from({length: subjectsCount}, (_,idx) => makeSubject(`${i}-${idx}`));
    out.push({ id: `map-${i+1}`, college, course, semester, section, subjects });
  }
  store = out;
}

export function getMappings(){
  if (!store) build(60);
  return store.slice();
}

export function getMapping(id){
  if (!store) build(60);
  return store.find((s)=>s.id===id) || null;
}

export function deleteMapping(id){
  if (!store) build(60);
  store = store.filter((s)=>s.id!==id);
}
