import { useMemo, useRef, useState } from 'react';
import { Edit3, Trash2, HelpCircle, Upload } from 'lucide-react';
import ViewButton from '../components/ui/ViewButton.jsx';
import IconActionButton from '../components/ui/IconActionButton.jsx';
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

const SUBJECT_OPTIONS = [
  'Mathematics-I',
  'Physics',
  'Programming in C',
  'Python Programming',
  'Java Programming',
  'Data Structures',
  'Algorithms',
  'Operating Systems',
  'Database Management System',
  'Computer Networks',
  'Artificial Intelligence',
  'Machine Learning',
  'Software Engineering',
  'Web Development',
  'Cyber Security',
];

const EMPLOYEE_OPTIONS = [
  'Dr. Amit Sharma',
  'Prof. Rahul Verma',
  'Dr. Neha Gupta',
  'Prof. Ankit Singh',
  'Dr. Priya Joshi',
  'Prof. Mohit Kumar',
  'Dr. Shalini Agarwal',
  'Prof. Vivek Chauhan',
  'Dr. Pooja Sharma',
  'Prof. Deepak Kumar',
];

function makeDemoStudents(selectedSubject, selectedEmployee) {
  const names = [
    'Aarav Sharma','Vivaan Kumar','Aditya Singh','Vihaan Patel','Arjun Gupta',
    'Ananya Reddy','Sana Khan','Meera Patel','Ishaan Rao','Rohan Verma',
    'Kavya Joshi','Priya Nair','Ritika Desai','Siddharth Malhotra','Nikhil Roy',
  ];
  const statuses = ['Active','Inactive','Suspended'];
  const subjectCodeMap = {
    'Mathematics-I': 'MA101',
    'Physics': 'PH102',
    'Programming in C': 'CS103',
    'Python Programming': 'CS104',
    'Java Programming': 'CS105',
    'Data Structures': 'CS201',
    'Algorithms': 'CS202',
    'Operating Systems': 'CS305',
    'Database Management System': 'CS302',
    'Computer Networks': 'CS308',
    'Artificial Intelligence': 'CS410',
    'Machine Learning': 'CS411',
    'Software Engineering': 'CS312',
    'Web Development': 'CS313',
    'Cyber Security': 'CS414',
  };

  const code = subjectCodeMap[selectedSubject] || 'CS999';

  return names.map((full, i) => ({
    id: `demo-${i + 1}`,
    sno: i + 1,
    photo: '',
    name: full,
    roll: `R-${1000 + i}`,
    universityRoll: `U2024-${101 + i}`,
    course: i % 2 === 0 ? 'B.Tech' : 'BCA',
    semester: i % 3 === 0 ? '3' : '5',
    allocatedSubject: selectedSubject,
    subjectCode: code,
    faculty: selectedEmployee,
    status: statuses[i % statuses.length],
  }));
}

export default function AllocateSubjectPage() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_OPTIONS[0]);
  const [selectedEmployee, setSelectedEmployee] = useState(EMPLOYEE_OPTIONS[0]);
  const [showSubjectsColumn, setShowSubjectsColumn] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedUploadFileName, setSelectedUploadFileName] = useState('');
  const uploadInputRef = useRef(null);

  const handleUploadExcel = () => {
    uploadInputRef.current?.click();
  };

  const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const nextChar = line[index + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values.map((value) => value.trim());
  };

  const mapCsvHeaders = (headers) => {
    return headers.map((header) => {
      const normalized = String(header).trim().toLowerCase();
      if (normalized.includes('student') && normalized.includes('name')) return 'name';
      if (normalized.includes('roll') && normalized.includes('university')) return 'universityRoll';
      if (normalized === 'roll' || normalized.includes('roll number')) return 'roll';
      if (normalized.includes('subject') && normalized.includes('code')) return 'subjectCode';
      if (normalized.includes('allocated') && normalized.includes('subject')) return 'allocatedSubject';
      if (normalized.includes('faculty') || normalized.includes('teacher') || normalized.includes('employee')) return 'faculty';
      if (normalized.includes('course')) return 'course';
      if (normalized.includes('semester')) return 'semester';
      if (normalized.includes('status')) return 'status';
      return normalized.replace(/\r?\n/g, '');
    });
  };

  const handleUploadFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedUploadFileName(file.name);
    if (file.name.toLowerCase().endsWith('.csv')) {
      const content = await file.text();
      const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
      if (lines.length > 1) {
        const headers = mapCsvHeaders(parseCsvLine(lines[0]));
        const parsedRows = lines.slice(1).map((line, index) => {
          const values = parseCsvLine(line);
          const row = { id: `upload-${index + 1}`, sno: index + 1, photo: '', faculty: selectedEmployee, allocatedSubject: selectedSubject, subjectCode: '', course: '', semester: '', status: 'Active' };
          values.forEach((value, colIndex) => {
            const key = headers[colIndex] || `column${colIndex}`;
            row[key] = value;
          });
          if (!row.subjectCode && selectedSubject) {
            row.subjectCode = { Math: 'MA101', Physics: 'PH102', 'Programming in C': 'CS103', 'Python Programming': 'CS104', 'Java Programming': 'CS105', 'Data Structures': 'CS201', 'Algorithms': 'CS202', 'Operating Systems': 'CS305', 'Database Management System': 'CS302', 'Computer Networks': 'CS308', 'Artificial Intelligence': 'CS410', 'Machine Learning': 'CS411', 'Software Engineering': 'CS312', 'Web Development': 'CS313', 'Cyber Security': 'CS414' }[selectedSubject] || 'CS999';
          }
          return row;
        });
        setRows(parsedRows);
        setShowTable(true);
      } else {
        alert('CSV file was selected but it contained no rows.');
      }
    } else {
      setShowTable(true);
      alert('Excel file selected. File picker works, but detailed XLS/XLSX parsing is not implemented in this demo.');
    }

    // Reset input to allow re-uploading the same file if needed.
    event.target.value = '';
  };

  const handleViewRow = (row) => {
    alert(`View details for ${row.name || 'student'}:\n\nRoll: ${row.roll || 'N/A'}\nUniversity Roll: ${row.universityRoll || 'N/A'}\nSubject: ${row.allocatedSubject || 'N/A'}\nFaculty: ${row.faculty || 'N/A'}\nStatus: ${row.status || 'N/A'}`);
  };

  const handleEditRow = (row) => {
    const updatedSubject = window.prompt('Edit allocated subject', row.allocatedSubject || selectedSubject);
    if (updatedSubject === null) return;
    const updatedFaculty = window.prompt('Edit faculty', row.faculty || selectedEmployee);
    if (updatedFaculty === null) return;

    setRows((currentRows) => currentRows.map((currentRow) => {
      if (currentRow.id !== row.id) return currentRow;
      return {
        ...currentRow,
        allocatedSubject: updatedSubject,
        faculty: updatedFaculty,
      };
    }));
  };

  const handleDeleteRow = (row) => {
    if (!window.confirm(`Delete allocation for ${row.name || 'this student'}?`)) return;
    setRows((currentRows) => currentRows.filter((currentRow) => currentRow.id !== row.id));
  };

  const handleNeedHelp = () => {
    alert('Need Help action triggered. Please contact support or check the documentation.');
  };

  const handleGo = () => {
    if (!selectedCollege) {
      alert('Please select a college/section before proceeding');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRows(makeDemoStudents(selectedSubject, selectedEmployee));
      setShowTable(true);
      setLoading(false);
    }, 400);
  };

  const columns = useMemo(() => {
    const baseColumns = [
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
            <IconActionButton
              icon={Edit3}
              title="Edit allocation"
              ariaLabel="Edit allocation"
              variant="primary"
              onClick={() => handleEditRow(row)}
            />
            <IconActionButton
              icon={Trash2}
              title="Remove allocation"
              ariaLabel="Remove allocation"
              variant="danger"
              onClick={() => handleDeleteRow(row)}
            />
            <ViewButton
              title="View details"
              ariaLabel="View details"
              onClick={() => handleViewRow(row)}
            />
          </div>
        ),
      },
    ];

    if (!showSubjectsColumn) {
      return baseColumns.filter((column) => column.key !== 'allocatedSubject' && column.key !== 'subjectCode');
    }

    return baseColumns;
  }, [showSubjectsColumn]);

  return (
    <div className="min-h-screen bg-[#F5F7FB] py-6 text-slate-900">
      <div className="space-y-6 w-full max-w-full">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <Breadcrumb items={[{ to: '/', label: 'Dashboard' }, { to: '/students', label: 'Student' }, { label: 'Assign Subject' }]} />
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-950">Assign Subject</h1>
              <span className="text-sm text-slate-600">Assign Subject</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={handleUploadExcel} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
              <Upload className="h-4 w-4" />
              Upload Excel
            </button>
            <button type="button" onClick={handleNeedHelp} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <HelpCircle className="h-4 w-4" />
              Need Help
            </button>
          </div>
          <input
            ref={uploadInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleUploadFileChange}
          />
          {selectedUploadFileName ? (
            <p className="mt-2 text-sm text-slate-600">Selected file: {selectedUploadFileName}</p>
          ) : null}
        </div>

        <div className="rounded-[8px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-4">
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
            <div className="lg:col-span-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Select Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-4">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Select Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="h-12 w-full rounded-3xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none"
              >
                {EMPLOYEE_OPTIONS.map((employee) => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Selected College</p>
              <p className="mt-2 text-sm font-semibold text-slate-950 truncate">{selectedCollege || 'No college selected'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Selected Subject</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{selectedSubject}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Assigned Employee</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{selectedEmployee}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Show Subjects Column</p>
                <p className="text-sm text-slate-500">Toggle columns in the assignment table.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSubjectsColumn((prev) => !prev)}
                className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors ${showSubjectsColumn ? 'bg-slate-950' : 'bg-slate-300'}`}
              >
                <span className={`absolute left-0.5 h-8 w-8 rounded-full bg-white shadow transition-transform ${showSubjectsColumn ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleGo}
                className="h-11 rounded-2xl bg-sky-700 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {showTable && (
          <div className="rounded-[20px] bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <DataTableAdvanced columns={columns} rows={rows} loading={loading} initialPageSize={10} onEdit={handleEditRow} onDelete={handleDeleteRow} />
          </div>
        )}
      </div>
    </div>
  );
}
