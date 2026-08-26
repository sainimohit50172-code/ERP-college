import { useMemo, useState } from 'react';
import { CheckCircle2, ClipboardCheck, FileSpreadsheet, FileText, Filter, History, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Modal from '../components/ui/Modal.jsx';
import { useResourceList } from '../hooks/useResourceHooks.js';
import api from '../api/axios.js';

const certificateNamesResource = 'compliance-certificate-names';
const fallbackCertificateNames = ['Fire Safety Certificate', 'Building Safety Certificate', 'Health and Sanitation Certificate', 'Electrical Safety Certificate'];
const initialForm = { studentId: '', certificateType: '', issueDate: new Date().toISOString().slice(0, 10), status: 'Draft', remarks: '' };
const emptyItems = [];

const valueOf = (item, keys, fallback = '') => keys.reduce((value, key) => value ?? item?.[key], null) ?? fallback;

export default function ComplianceCertificatePage() {
  const [form, setForm] = useState(initialForm);
  const [studentSearch, setStudentSearch] = useState('');
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { data: studentsData = {}, isLoading: studentsLoading } = useResourceList('students', { page: 1, pageSize: 1000 });
  const { data: namesData = {} } = useResourceList(certificateNamesResource, { page: 1, pageSize: 100 });
  const students = studentsData.items || emptyItems;
  const configuredNames = namesData.items || emptyItems;
  const certificateNames = configuredNames.length ? configuredNames.map((item) => valueOf(item, ['name', 'certificateName', 'title'], 'Certificate')) : fallbackCertificateNames;

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [student.name, student.firstName, student.lastName, student.admissionNumber, student.rollNumber, student.enrollmentNumber]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(query)));
  }, [students, studentSearch]);

  const selectedStudent = students.find((student) => String(valueOf(student, ['id', '_id'])) === String(form.studentId));
  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const resetForm = () => {
    setForm({ ...initialForm, certificateType: certificateNames[0] || '' });
    setStudentSearch('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.studentId || !form.certificateType || !form.issueDate) {
      toast.error('Student, certificate type and issue date are required.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.post('/certificates/save', {
        student_id: Number(form.studentId),
        certificate_type: form.certificateType,
        issue_date: form.issueDate,
        status: form.status,
        remarks: form.remarks.trim() || null,
      });
      const saved = response.data?.data || response.data;
      setIssuedCertificates((current) => [{ ...saved, student: selectedStudent, certificate_type: form.certificateType, issue_date: form.issueDate, status: form.status, remarks: form.remarks }, ...current]);
      toast.success('Compliance certificate saved successfully.');
      resetForm();
      setIsFilterOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Could not save compliance certificate.');
    } finally {
      setIsSaving(false);
    }
  };

  const studentName = (student) => valueOf(student, ['name'], [student?.firstName, student?.lastName].filter(Boolean).join(' ') || 'Unnamed student');
  const studentMeta = (student) => valueOf(student, ['admissionNumber', 'rollNumber', 'enrollmentNumber'], 'ID unavailable');

  return (
    <div className="min-h-[calc(100vh-7rem)] space-y-6 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f0fdf4_100%)] px-3 pb-8 sm:px-5 lg:px-6">
      <section className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-sm">
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="absolute right-0 top-0 h-36 w-36 rounded-bl-[90px] bg-emerald-50" />
          <div className="relative">
            <Breadcrumb items={[{ label: 'Settings', to: '/settings' }, { label: 'Institute Setup', to: '/settings/institute' }, { label: 'Compliance Certificate Names', to: '/settings/institute/compliance-certificate-names' }, { label: 'Compliance Certificate' }]} />
            <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" /> Compliance desk</div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Compliance Certificate</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">Issue and track student compliance certificates using your institution&apos;s configured certificate names.</p>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"><ClipboardCheck className="h-5 w-5 text-emerald-600" /><div><p className="text-xs uppercase tracking-[0.18em] text-slate-500">Ready to issue</p><p className="mt-1 text-sm font-semibold text-slate-900">{certificateNames.length} certificate types</p></div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700"><History className="h-5 w-5" /></div><div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-600">Certificate records</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">Issued compliance certificates</h2></div></div>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={() => setIsFilterOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><Filter className="h-4 w-4" /> Filter</button><button type="button" onClick={() => { const rows = issuedCertificates.map((certificate) => [certificate.certificate_type, studentName(certificate.student), certificate.issue_date, certificate.status]); const csv = [['Certificate Type', 'Student', 'Issue Date', 'Status'], ...rows].map((row) => row.map((value) => `"${String(value || '').replaceAll('"', '""')}"`).join(',')).join('\n'); const link = document.createElement('a'); link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`; link.download = 'compliance-certificates.csv'; link.click(); }} className="inline-flex items-center gap-2 rounded-xl bg-[#101824] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a2635]"><FileSpreadsheet className="h-4 w-4" /> Excel</button></div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-[#101824] text-xs uppercase tracking-[0.12em] text-white"><tr><th className="px-4 py-4">S. No.</th><th className="px-4 py-4">Certificate type</th><th className="px-4 py-4">Student</th><th className="px-4 py-4">Issue date</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Remarks</th></tr></thead><tbody className="divide-y divide-slate-200 bg-white">{issuedCertificates.length === 0 ? <tr><td colSpan="6" className="px-4 py-16 text-center"><FileText className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-700">No certificate records found</p><p className="mt-1 text-sm text-slate-500">Use Filter to create the first compliance certificate.</p></td></tr> : issuedCertificates.map((certificate, index) => <tr key={certificate.id ?? index} className="transition hover:bg-emerald-50/40"><td className="px-4 py-4 text-slate-500">{index + 1}</td><td className="px-4 py-4 font-semibold text-slate-900">{certificate.certificate_type}</td><td className="px-4 py-4 text-slate-700">{studentName(certificate.student)}<div className="mt-1 text-xs text-slate-400">{studentMeta(certificate.student)}</div></td><td className="px-4 py-4 text-slate-600">{certificate.issue_date}</td><td className="px-4 py-4"><span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">{certificate.status}</span></td><td className="max-w-xs px-4 py-4 text-slate-500">{certificate.remarks || '-'}</td></tr>)}</tbody></table></div>
      </section>

      <Modal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Create compliance certificate" footer={<><button type="button" onClick={() => setIsFilterOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="button" onClick={() => document.getElementById('compliance-certificate-form')?.requestSubmit()} disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><CheckCircle2 className="h-4 w-4" /> {isSaving ? 'Saving...' : 'Save certificate'}</button></>}>
        <form id="compliance-certificate-form" onSubmit={handleSubmit} className="space-y-5">
          <div><label htmlFor="certificate-student-search" className="mb-2 block text-sm font-semibold text-slate-700">Find student</label><input id="certificate-student-search" value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search by name, admission or roll number" className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /><select value={form.studentId} onChange={(event) => setField('studentId', event.target.value)} disabled={studentsLoading} className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"><option value="">{studentsLoading ? 'Loading students...' : 'Select student'}</option>{filteredStudents.map((student) => { const id = valueOf(student, ['id', '_id']); return <option key={id} value={id}>{studentName(student)} - {studentMeta(student)}</option>; })}</select></div>
          <div className="grid gap-5 sm:grid-cols-2"><label htmlFor="certificate-type" className="grid gap-2 text-sm font-semibold text-slate-700">Certificate type<select id="certificate-type" value={form.certificateType} onChange={(event) => setField('certificateType', event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="">Select certificate type</option>{certificateNames.map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label htmlFor="certificate-issue-date" className="grid gap-2 text-sm font-semibold text-slate-700">Issue date<input id="certificate-issue-date" type="date" value={form.issueDate} onChange={(event) => setField('issueDate', event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label></div>
          <label htmlFor="certificate-status" className="grid gap-2 text-sm font-semibold text-slate-700">Certificate status<select id="certificate-status" value={form.status} onChange={(event) => setField('status', event.target.value)} className="h-12 rounded-xl border border-slate-200 bg-white px-3 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"><option value="Draft">Draft</option><option value="Issued">Issued</option><option value="Cancelled">Cancelled</option></select></label>
          <label htmlFor="certificate-remarks" className="grid gap-2 text-sm font-semibold text-slate-700">Remarks<span className="font-normal text-slate-400">Optional note for the certificate record</span><textarea id="certificate-remarks" rows="4" value={form.remarks} onChange={(event) => setField('remarks', event.target.value)} placeholder="Add any verification or issue note" className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>
        </form>
      </Modal>
    </div>
  );
}
