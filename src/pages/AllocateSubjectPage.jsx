import { useMemo, useState } from 'react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import DataTableAdvanced from '../components/ui/DataTableAdvanced.jsx';

const COLLEGE_OPTIONS = [
  'ROORKEE COLLEGE OF SMART COMPUTING | BCA AI-ML | SEM 3 - B',
  'ROORKEE COLLEGE OF SMART COMPUTING | BCA | SEM 3 - A',
  'ROORKEE COLLEGE OF SMART COMPUTING | MCA | SEM 3 - A',
  'ROORKEE COLLEGE OF SMART COMPUTING | B.TECH. HONS. CSE | SEM 3 - C',
  'ROORKEE COLLEGE OF SMART COMPUTING | B.TECH. HONS. CSE | SEM 3 - A',
  'ROORKEE COLLEGE OF SMART COMPUTING | B.TECH. HONS. CSE | SEM 3 - B',
  'ROORKEE COLLEGE OF SMART COMPUTING | BCA | SEM 5 - A',
];

function makeDemoStudents() {
  const names = [
    'Aarav Sharma','Vivaan Kumar','Aditya Singh','Vihaan Patel','Arjun Gupta',
    'Ananya Reddy','Sana Khan','Meera Patel','Ishaan Rao','Rohan Verma',
    'Kavya Joshi','Priya Nair','Ritika Desai','Siddharth Malhotra','Nikhil Roy',
  ];
  const subjects = [
    { name: 'Data Structures', code: 'CS201' },
    { name: 'Operating Systems', code: 'CS305' },
    { name: 'Database Systems', code: 'CS302' },
    { name: 'Computer Networks', code: 'CS308' },
    { name: 'Artificial Intelligence', code: 'CS410' },
  ];
  const faculties = ['Dr. R.K. Sharma','Prof. Meera Joshi','Dr. S. Kaur','Mr. P. Nair','Ms. R. Dixit'];
  const statuses = ['Active','Inactive','Suspended'];

  return names.map((full, i) => {
    const [first, last] = full.split(' ');
    const subject = subjects[i % subjects.length];
    return {
      id: `demo-${i+1}`,
      sno: i + 1,
      photo: '',
      name: full,
      roll: `R-${1000 + i}`,
      universityRoll: `U2024-${101 + i}`,
      course: i % 2 === 0 ? 'B.Tech' : 'BCA',
      semester: i % 3 === 0 ? '3' : '5',
      allocatedSubject: subject.name,
      subjectCode: subject.code,
      faculty: faculties[i % faculties.length],
      status: statuses[i % statuses.length],
    };
  });
}

export default function AllocateSubjectPage() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  const handleGo = () => {
    if (!selectedCollege) {
      alert('Please select a college/section before proceeding');
      return;
    }
    setLoading(true);
    // simulate load
    setTimeout(() => {
      setRows(makeDemoStudents());
      setShowTable(true);
      setLoading(false);
    }, 400);
  };

  const columns = useMemo(() => [
    { key: 'sno', label: 'S.No' },
    { key: 'photo', label: 'Student Photo', render: () => (<div className="h-8 w-8 rounded-full bg-slate-200" />) },
    { key: 'name', label: 'Student Name' },
    { key: 'roll', label: 'Roll Number' },
    { key: 'universityRoll', label: 'University Roll Number' },
    { key: 'course', label: 'Course' },
    { key: 'semester', label: 'Semester' },
    { key: 'allocatedSubject', label: 'Allocated Subject' },
    { key: 'subjectCode', label: 'Subject Code' },
    { key: 'faculty', label: 'Faculty' },
    { key: 'status', label: 'Status' },
    {
      key: 'action', label: 'Action', render: (_, row) => (
        <div className="flex gap-2">
          <button title="Edit Allocation" className="h-9 rounded-2xl bg-white border px-3 text-sm">Edit</button>
          <button title="Remove Allocation" className="h-9 rounded-2xl bg-white border px-3 text-sm">Remove</button>
          <button title="View Details" className="h-9 rounded-2xl bg-white border px-3 text-sm">View</button>
        </div>
      ),
    },
  ], []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] -mx-3 sm:-mx-4 lg:-mx-6 px-[10px] py-6 text-slate-900">
      <div className="space-y-6 w-full max-w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Breadcrumb items={[{ to: '/', label: 'Dashboard' }, { to: '/students', label: 'Student' }, { label: 'Allocate Subject' }]} />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Allocate Subject</h1>
              <span className="text-sm text-slate-600">Allocate Subject</span>
            </div>
          </div>
        </div>

        <div className="rounded-[8px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="grid grid-cols-12 gap-3 items-center">
            <div className="col-span-10">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Select College</label>
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                <option value="">-- Select --</option>
                {COLLEGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={handleGo}
                className="h-11 rounded-2xl bg-sky-700 px-4 py-2 text-sm font-semibold text-white"
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {showTable && (
          <div className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <DataTableAdvanced columns={columns} rows={rows} loading={loading} initialPageSize={10} />
          </div>
        )}
      </div>
    </div>
  );
}
