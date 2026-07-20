import { useState } from 'react';
import { ChevronRight, FileText, Plus, Printer, RefreshCw, Share, HelpCircle, Settings, Pencil, X, RotateCw } from 'lucide-react';

const STAT_CARDS = [
  { title: 'TOTAL', count: 2369 },
  { title: 'ENQUIRY', count: 2369 },
  { title: 'APPROVED', count: 0 },
  { title: 'REJECTED', count: 0 },
  { title: 'WITHDRAWN', count: 0 },
];

const TABLE_ROWS = [
  {
    id: 1,
    stage: 'Enquiry',
    formNo: 'HU-2026-27/4517',
    student: 'KIMAYA BALASUBRAMANIAN',
    college: 'ROORKEE COLLEGE OF ENGINEERING',
    course: 'Ph.D. EEE',
    counselor: 'Nisha Pal',
    date: '16-May-2026 03:29:0',
  },
  {
    id: 2,
    stage: 'Enquiry',
    formNo: 'HU-2026-27/4516',
    student: 'HRISHITA ACHARYA',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Cyber Security',
    counselor: 'Nisha Pal',
    date: '16-May-2026 03:29:0',
  },
  {
    id: 3,
    stage: 'Enquiry',
    formNo: 'HU-2026-27/4515',
    student: 'ZAINA ANNE',
    college: 'Roorkee College of Allied Health Sciences',
    course: 'B.Sc. Nursing (with AI)',
    counselor: 'Nisha Pal',
    date: '16-May-2026 03:29:0',
  },
];

const today = new Date().toISOString().slice(0, 10);

export default function ApplicationsPage() {
  const [session, setSession] = useState('2026-27 Odd');
  const [searchBy, setSearchBy] = useState('Name');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: today,
    college: '',
    feeCategory: '',
    admissionCategory: '',
    source: '',
    concession: '',
    tag: '',
    counselor: '',
    studentName: '',
    dob: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    remark: '',
  });

  const inputClass =
    'w-full bg-transparent border-b border-slate-300 pb-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none';

  const selectClass =
    'w-full bg-transparent border-b border-slate-300 pb-2 text-sm text-slate-900 focus:border-[#1e3a5f] focus:outline-none';

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      date: today,
      college: '',
      feeCategory: '',
      admissionCategory: '',
      source: '',
      concession: '',
      tag: '',
      counselor: '',
      studentName: '',
      dob: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      remark: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <div className="w-full max-w-full pb-10 pt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Dashboard <span className="mx-2">&gt;</span> Application Data
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">Application Data</h1>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
            <label htmlFor="session" className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">
              Select Session
            </label>
            <select
              id="session"
              value={session}
              onChange={(event) => setSession(event.target.value)}
              className="ml-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            >
              <option>2026-27 Odd</option>
              <option>2026-27 Even</option>
              <option>2025-26 Odd</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
          >
            <Plus size={16} /> Add Application Data
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 hover-gradient-border">
            <Printer size={16} /> Print
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 hover-gradient-border">
            <Plus size={16} /> Generate Report
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 hover-gradient-border">
            <Share size={16} /> Upload Excel
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <FileText size={16} /> Filter
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900 hover-gradient-border">
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <HelpCircle size={16} /> Need Help
          </button>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-5">
          {STAT_CARDS.map((card) => (
            <div key={card.title} className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{card.title}</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">Count: {card.count}</div>
            </div>
          ))}
        </div>

        <div className="mb-6 rounded-3xl bg-[#eff4fb] p-5 text-slate-700 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm leading-6">
            <span className="font-semibold text-slate-900">Note:</span> Direct export is no longer available. Use 'Generate Report' to create your file, then download it from the 'Download Report' section.
          </p>
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search By</label>
            <select
              value={searchBy}
              onChange={(event) => setSearchBy(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            >
              <option>Name</option>
              <option>Application No.</option>
              <option>Mobile No.</option>
              <option>Father Name</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search by Name/Application No./Mobile No./Father Name"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
            />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex-1 text-center text-lg font-semibold uppercase tracking-[0.24em] text-slate-950">
              Admission Application Report
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover-gradient-border">
              <Pencil size={16} /> Edit
            </button>
          </div>

          <div className="mb-6 h-[1px] bg-slate-200"></div>

          <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
            <table className="w-full table-fixed text-xs min-w-[860px]">
              <colgroup>
                <col className="w-[4%]" />
                <col className="w-[8%]" />
                <col className="w-[10%]" />
                <col className="w-[15%]" />
                <col className="w-[18%]" />
                <col className="w-[15%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead className="bg-[#1e3a5f] text-white">
                <tr>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">S.No</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Action</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Stage</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Form No</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Student Name</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">College</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Course</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Counselor</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[11px]">
                {TABLE_ROWS.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-l-4 border-red-500`}
                  >
                    <td className="whitespace-nowrap px-2 py-3 font-medium text-slate-900">{row.id}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-700 action-cell">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition hover:bg-slate-200 hover-gradient-border">
                        <Settings size={14} />
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-700">{row.stage}</td>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-900">
                      <a href="#" className="block truncate font-semibold text-sky-600 hover:text-sky-700 hover-gradient-border">
                        {row.formNo}
                      </a>
                    </td>
                    <td className="px-2 py-3 text-slate-900">
                      <a href="#" className="block truncate font-semibold text-sky-600 hover:text-sky-700 hover-gradient-border">
                        {row.student}
                      </a>
                    </td>
                    <td className="px-2 py-3 text-slate-700 truncate">{row.college}</td>
                    <td className="px-2 py-3 text-slate-700 truncate">{row.course}</td>
                    <td className="px-2 py-3 text-slate-700 truncate">{row.counselor}</td>
                    <td className="px-2 py-3 text-slate-700 truncate">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <span className="font-semibold">Items Per Page:</span>
              <select className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10 hover-gradient-border">
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-slate-700 sm:justify-end">
              <div>1 - 10 of 2369</div>
              <div className="inline-flex items-center gap-2">
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 hover-gradient-border">
                  &lt;
                </button>
                <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-100 hover-gradient-border">
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-[500px] h-[800px] overflow-hidden rounded-[12px] border border-slate-200 bg-gradient-to-b from-white to-[#eef2f7] shadow-[0_30px_100px_rgba(15,23,42,0.16)]">
            <div className="grid h-full grid-rows-[auto_1fr]">
              <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
                <div className="h-10 w-1 rounded-full bg-slate-900" />
                <div className="flex-1 text-sm font-semibold uppercase tracking-[0.25em] text-slate-700">Add Application Data</div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-100"
                >
                  <RotateCw size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 transition hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                  <div className="space-y-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">Enquiry Details</div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Date</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(event) => handleFormChange('date', event.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Select College</label>
                        <select
                          value={formData.college}
                          onChange={(event) => handleFormChange('college', event.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose college</option>
                          <option value="roorkee">Roorkee College of Engineering</option>
                          <option value="allied-health">Allied Health Sciences</option>
                          <option value="smart-computing">Smart Computing</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Select Fee Category</label>
                        <select
                          value={formData.feeCategory}
                          onChange={(event) => handleFormChange('feeCategory', event.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose fee category</option>
                          <option value="regular">Regular</option>
                          <option value="scholarship">Scholarship</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Select Admission Category</label>
                        <select
                          value={formData.admissionCategory}
                          onChange={(event) => handleFormChange('admissionCategory', event.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose category</option>
                          <option value="new">New</option>
                          <option value="transfer">Transfer</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Choose Source</label>
                        <select
                          value={formData.source}
                          onChange={(event) => handleFormChange('source', event.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose source</option>
                          <option value="website">Website</option>
                          <option value="referral">Referral</option>
                          <option value="walkin">Walk-in</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Select Concession</label>
                        <select
                          value={formData.concession}
                          onChange={(event) => handleFormChange('concession', event.target.value)}
                          className={selectClass}
                        >
                          <option value="">Choose concession</option>
                          <option value="none">None</option>
                          <option value="merit">Merit</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Choose Tag</label>
                        <button
                          type="button"
                          onClick={() => handleFormChange('tag', 'high-priority')}
                          className="inline-flex min-w-full items-center justify-between rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-400"
                        >
                          {formData.tag || 'Select Tag'}
                        </button>
                      </div>
                      <div>
                        <label className="mb-2 block text-[13px] text-slate-500">Select Counselor</label>
                        <button
                          type="button"
                          onClick={() => handleFormChange('counselor', 'Nisha Pal')}
                          className="inline-flex min-w-full items-center justify-between rounded-full border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 transition hover:border-slate-400"
                        >
                          {formData.counselor || 'Select Counselor'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-900">Personal Details</div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">Student Name</label>
                      <input
                        type="text"
                        value={formData.studentName}
                        onChange={(event) => handleFormChange('studentName', event.target.value)}
                        placeholder="Enter student name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">DOB</label>
                      <input
                        type="date"
                        value={formData.dob}
                        onChange={(event) => handleFormChange('dob', event.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(event) => handleFormChange('phone', event.target.value)}
                        placeholder="Enter phone number"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => handleFormChange('email', event.target.value)}
                        placeholder="Enter email address"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-900">Address</div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">Address</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(event) => handleFormChange('address', event.target.value)}
                        placeholder="Enter address"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">City</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(event) => handleFormChange('city', event.target.value)}
                        placeholder="Enter city"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">State</label>
                      <select
                        value={formData.state}
                        onChange={(event) => handleFormChange('state', event.target.value)}
                        className={selectClass}
                      >
                        <option value="">Choose state</option>
                        <option value="uttar-pradesh">Uttar Pradesh</option>
                        <option value="jharkhand">Jharkhand</option>
                        <option value="haryana">Haryana</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pb-20">
                    <div className="text-sm font-semibold text-slate-900">Institute Info</div>
                    <div>
                      <label className="mb-2 block text-[13px] text-slate-500">Remark</label>
                      <textarea
                        value={formData.remark}
                        onChange={(event) => handleFormChange('remark', event.target.value)}
                        placeholder="Enter remark"
                        rows={4}
                        className="w-full bg-transparent border-b border-slate-300 px-0 pb-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#1e3a5f] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-gradient-to-t from-[#eef2f7] via-[#eef2f7] to-transparent px-6 py-4">
                  <button
                    type="button"
                    className="w-full rounded-[8px] bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-900 hover-gradient-border"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
