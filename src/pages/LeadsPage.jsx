import { useState } from 'react';
import { Filter, FileText, Plus, Search, Settings, Pencil } from 'lucide-react';

const INITIAL_ROWS = [
  {
    id: 1,
    tag: '',
    applicationNumber: 'HU-2026-27/4517',
    date: '16-May-2026',
    time: '03:29:04 pm',
    name: 'KIMAYA BALASUBRAMANIAN',
    phone: '9988776655',
    college: 'ROORKEE COLLEGE OF ENGINEERING',
    course: 'Ph.D. EEE',
    source: 'HUWEB',
  },
  {
    id: 2,
    tag: '',
    applicationNumber: 'HU-2026-27/4516',
    date: '16-May-2026',
    time: '03:29:04 pm',
    name: 'HRISHITA ACHARYA',
    phone: '9123456780',
    college: 'Roorkee College of Smart Computing',
    course: 'BCA Cyber Security',
    source: 'HUWEB',
  },
  {
    id: 3,
    tag: 'HOT',
    applicationNumber: 'HU-2026-27/4515',
    date: '16-May-2026',
    time: '03:29:04 pm',
    name: 'ZAINA ANNE',
    phone: '9876543210',
    college: 'Roorkee College of Allied Health Sciences',
    course: 'B.Sc. Nursing (with AI)',
    source: 'HUWEB',
  },
  {
    id: 4,
    tag: 'FOLLOWUP',
    applicationNumber: 'HU-2026-27/3484',
    date: '14-May-2026',
    time: '05:30:00 am',
    name: 'SIDDHARTH DIXIT',
    phone: '7055146429',
    college: 'Roorkee College of Smart Computing',
    course: 'B.Tech. Hons. Data Science',
    source: 'COLLEGE DEKHO',
  },
  {
    id: 5,
    tag: 'NPC',
    applicationNumber: 'HU-2026-27/2716',
    date: '12-May-2026',
    time: '05:30:00 am',
    name: 'DINESH CHAURASIA',
    phone: '9956330419',
    college: 'Roorkee College of Business Studies',
    course: 'B.Com',
    source: 'COLLEGE DEKHO',
  },
];

const tagClasses = {
  HOT: 'bg-[#fff1e6] text-[#b35a26]',
  FOLLOWUP: 'bg-[#f4eefc] text-[#684a9a]',
  NPC: 'bg-[#e8f7e7] text-[#27633d]',
};

const sourceClasses = {
  HUWEB: 'bg-[#f5f2ec] text-[#5f533d]',
  'COLLEGE DEKHO': 'bg-[#ffe4d6] text-[#9b3f10]',
  COLLEGEHAI: 'bg-[#fff5cc] text-[#6c5209]',
};

export default function LeadsPage() {
  const [searchBy, setSearchBy] = useState('Name');
  const [searchText, setSearchText] = useState('');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [college, setCollege] = useState('Roorkee College of Smart Computing');
  const [leadSource, setLeadSource] = useState('LIVE CHAT(HU)');
  const [campusVisited, setCampusVisited] = useState('Yes');
  const [addCounselor, setAddCounselor] = useState(false);
  const [rows, setRows] = useState(INITIAL_ROWS);

  const updateTag = (id, value) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, tag: value } : row)));
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-slate-900">
      <div className="w-full max-w-full pb-10 pt-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
              Dashboard <span className="mx-2">&gt;</span> Admission Leads
            </div>
            <h1 className="text-3xl font-semibold text-slate-950">Admission Lead</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              <Filter size={16} /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900">
              <FileText size={16} /> Excel
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-900"
              onClick={() => setIsAddLeadOpen(true)}
            >
              <Plus size={16} /> Add Lead
            </button>
            <label className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              <input
                type="checkbox"
                checked={globalSearch}
                onChange={() => setGlobalSearch((prev) => !prev)}
                className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
              />
              Global Search
            </label>
          </div>
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
              <option>References</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
            <div>
              <input
                type="text"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search by Name/Application No./Mobile No./Father Name/References"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
              />
            </div>
          </div>
        </div>
        {isAddLeadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
            <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">ADD LEAD</h2>
                  <p className="mt-1 text-sm text-slate-500">Enter the lead details and source information.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 gap-4 px-6 py-6 lg:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Alternate Phone Number</label>
                  <input
                    type="text"
                    value={alternatePhone}
                    onChange={(event) => setAlternatePhone(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Select College</label>
                  <select
                    value={college}
                    onChange={(event) => setCollege(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    <option>Roorkee College of Smart Computing</option>
                    <option>Roorkee College of Engineering</option>
                    <option>Roorkee College of Business Studies</option>
                    <option>Roorkee College of Agricultural Sciences</option>
                    <option>Roorkee College of Allied Health Sciences</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Choose Source</label>
                  <select
                    value={leadSource}
                    onChange={(event) => setLeadSource(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    <option>LIVE CHAT(HU)</option>
                    <option>COLLEGE DEKHO</option>
                    <option>FACEBOOK</option>
                    <option>COLLEGEHAI</option>
                    <option>SHIKSHA</option>
                    <option>COLLEGE DUNIA</option>
                    <option>KOLLEGEAPPLY</option>
                    <option>ZOLLEGE</option>
                    <option>GOOGLE-AD</option>
                    <option>CAMPUS VISIT</option>
                    <option>REGISTRATION(HU)</option>
                    <option>HUWEB</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Campus visited</label>
                  <select
                    value={campusVisited}
                    onChange={(event) => setCampusVisited(event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={addCounselor}
                      onChange={() => setAddCounselor((prev) => !prev)}
                      className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                    />
                    Add Counselor
                  </label>
                  <span className="text-xs text-slate-500">i</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="rounded-2xl bg-[#1e3a5f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  Save Lead
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-sm min-w-[980px]">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[13%]" />
                <col className="w-[14%]" />
                <col className="w-[10%]" />
                <col className="w-[14%]" />
                <col className="w-[9%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[13%]" />
              </colgroup>
              <thead className="bg-[#1e3a5f] text-white">
                <tr>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em] action-header">Action</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Tag</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Application Number</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Date</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Name</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Phone</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">College</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Course</th>
                  <th className="whitespace-nowrap px-2 py-3 text-left font-semibold uppercase tracking-[0.18em]">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[13px] text-slate-700">
                {rows.map((row, index) => (
                  <tr key={row.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'} border-l-4 border-red-500`}>
                    <td className="px-2 py-3 align-top action-cell">
                      <div className="inline-flex items-center gap-2">
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200">
                          <Settings size={14} />
                        </button>
                        <button className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3 align-top">
                      <div className="space-y-1">
                        <span className="block text-[11px] uppercase tracking-[0.18em] text-slate-500">Select Tag</span>
                        <select
                          value={row.tag}
                          onChange={(event) => updateTag(row.id, event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/10"
                        >
                          <option value="">Select Tag</option>
                          <option value="HOT">HOT</option>
                          <option value="FOLLOWUP">FOLLOWUP</option>
                          <option value="NPC">NPC</option>
                        </select>
                        {row.tag && (
                          <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${tagClasses[row.tag]}`}>
                            {row.tag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 align-top font-semibold text-slate-900 break-words">{row.applicationNumber}</td>
                    <td className="px-2 py-3 align-top break-words">
                      <div>{row.date}</div>
                      <div className="mt-1 text-[11px] text-slate-500">{row.time}</div>
                    </td>
                    <td className="px-2 py-3 align-top break-words">{row.name}</td>
                    <td className="px-2 py-3 align-top">{row.phone}</td>
                    <td className="px-2 py-3 align-top break-words">{row.college}</td>
                    <td className="px-2 py-3 align-top break-words">{row.course}</td>
                    <td className="px-2 py-3 align-top">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${sourceClasses[row.source]}`}>
                        {row.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
