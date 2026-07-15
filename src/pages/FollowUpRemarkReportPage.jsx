import { useState, useMemo, useEffect } from 'react';
import { Download, Filter, Plus, X, Trash2 } from 'lucide-react';

const INITIAL_DATA = [];

const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800',
  Completed: 'bg-emerald-100 text-emerald-800',
};

const SOURCES = ['HUWEB', 'COLLEGE DEKHO', 'COLLEGEHAI'];
const STATUSES = ['FOLLOWUP', 'COMPLETED', 'PENDING'];
const CITIES = ['Chennai', 'Haridwar', 'Roorkee', 'Pilibhit', 'Kanpur', 'Lucknow', 'Varanasi'];

export default function FollowUpRemarkReportPage() {
  const [data, setData] = useState(INITIAL_DATA);
  const [filterSource, setFilterSource] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [newRemark, setNewRemark] = useState({
    remarks: '',
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 8),
  });

  const filteredData = useMemo(() => {
    const filtered = data.filter((app) => {
      const matchesSearch =
        !searchText ||
        app.applicationNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        app.name.toLowerCase().includes(searchText.toLowerCase()) ||
        app.phone.includes(searchText);

      const matchesSource = !filterSource || app.source === filterSource;
      const matchesStatus = !filterStatus || app.status === filterStatus;
      const matchesCity = !filterCity || app.city === filterCity;

      return matchesSearch && matchesSource && matchesStatus && matchesCity;
    });
    return filtered;
  }, [data, searchText, filterSource, filterStatus, filterCity]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, filterSource, filterStatus, filterCity]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, currentPage, itemsPerPage]);

  const downloadCsv = () => {
    let csvContent = 'S.No,Application Number,Name,Phone,City,Course,Status,Source,Tags,H.Sl.,Remarks,Status,Date,Time\n';

    filteredData.forEach((app, appIndex) => {
      app.history.forEach((hist, histIndex) => {
        if (histIndex === 0) {
          csvContent += `${appIndex + 1},"${app.applicationNumber}","${app.name}","${app.phone}","${app.city}","${app.course}","${app.status}","${app.source}","${app.tags}",${hist.historyId},"${hist.remarks}","${hist.status}","${hist.date}","${hist.time}"\n`;
        } else {
          csvContent += `,"","","","","","","","",${hist.historyId},"${hist.remarks}","${hist.status}","${hist.date}","${hist.time}"\n`;
        }
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'follow-up-remark-report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openAddRemark = (app) => {
    setSelectedApplication(app);
    setNewRemark({
      remarks: '',
      status: 'Pending',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 8),
    });
    setIsAddRemarkOpen(true);
  };

  const handleAddRemark = () => {
    if (!newRemark.remarks.trim()) {
      alert('Please enter a remark');
      return;
    }

    const formattedDate = new Date(newRemark.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');

    const updatedData = data.map((app) => {
      if (app.id === selectedApplication.id) {
        const maxHistoryId = Math.max(...app.history.map((h) => h.historyId), 0);
        return {
          ...app,
          history: [
            ...app.history,
            {
              historyId: maxHistoryId + 1,
              remarks: newRemark.remarks,
              status: newRemark.status,
              date: formattedDate,
              time: newRemark.time,
            },
          ],
        };
      }
      return app;
    });

    setData(updatedData);
    setIsAddRemarkOpen(false);
    alert('Remark added successfully');
  };

  const handleDeleteRemark = (appId, historyId) => {
    if (!window.confirm('Are you sure you want to delete this remark?')) return;

    const updatedData = data.map((app) => {
      if (app.id === appId) {
        return {
          ...app,
          history: app.history.filter((h) => h.historyId !== historyId),
        };
      }
      return app;
    });

    setData(updatedData);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.28em] text-slate-500">
            Dashboard <span className="mx-2">&gt;</span> Admission Reports <span className="mx-2">&gt;</span> Follow Up Remark Report
          </div>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Follow Up Remark Report</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Download size={16} /> Export To Excel
          </button>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-[0.24em] text-slate-500">Search</label>
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by Application Number, Name, or Phone"
            className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[1100px] text-[13px] text-slate-700" style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '3%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '8%' }} />
            </colgroup>
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">S.No</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Application<br/>Number</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Name</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Phone</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">City</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Course</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Status</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Source</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" rowSpan="2">Tags</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700" colSpan="5">Leads History</th>
              </tr>
              <tr className="bg-slate-900 text-white border-t border-slate-700">
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700">H.Sl.</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700">Remarks</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700">Status</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-slate-700">Date</th>
                <th className="whitespace-nowrap px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-[0.14em] action-header">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((app, appIndex) => (
                <tr key={`app-${app.id}`} className={appIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{appIndex + 1}</td>
                  <td className="px-2 py-1 align-top text-blue-600 font-semibold border-r border-slate-200" rowSpan={app.history.length || 1}>{app.applicationNumber}</td>
                  <td className="px-2 py-1 align-top text-slate-900 font-semibold break-words border-r border-slate-200" rowSpan={app.history.length || 1}>{app.name}</td>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{app.phone}</td>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{app.city}</td>
                  <td className="px-2 py-1 align-top text-slate-900 break-words border-r border-slate-200" rowSpan={app.history.length || 1}>{app.course}</td>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{app.status}</td>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{app.source}</td>
                  <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200" rowSpan={app.history.length || 1}>{app.tags}</td>
                  {app.history.length > 0 ? (
                    <>
                      <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200">{app.history[0].historyId}</td>
                      <td className="px-2 py-1 align-top text-slate-900 break-words border-r border-slate-200 text-[12px]">{app.history[0].remarks}</td>
                      <td className="px-2 py-1 align-top border-r border-slate-200">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${STATUS_STYLES[app.history[0].status]}`}>
                          {app.history[0].status}
                        </span>
                      </td>
                      <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200 text-[12px]">{app.history[0].date}</td>
                      <td className="px-2 py-1 align-top text-slate-700 action-cell">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openAddRemark(app)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-600 transition hover:bg-green-200"
                            title="Add remark"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRemark(app.id, app.history[0].historyId)}
                            className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-red-600 transition hover:bg-red-200"
                            title="Delete remark"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan="4" className="px-2 py-1 align-top text-slate-500 italic text-[12px]">No history</td>
                      <td className="px-2 py-1 align-top text-slate-700">
                        <button
                          type="button"
                          onClick={() => openAddRemark(app)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-600 transition hover:bg-green-200"
                          title="Add remark"
                        >
                          <Plus size={12} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {paginatedData.length > 0 &&
                paginatedData.map((app) =>
                  app.history.length > 1
                    ? app.history.slice(1).map((hist, histIndex) => (
                        <tr
                          key={`hist-${app.id}-${hist.historyId}`}
                          className={app.id % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                        >
                          <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200">{hist.historyId}</td>
                          <td className="px-2 py-1 align-top text-slate-900 break-words border-r border-slate-200 text-[12px]">{hist.remarks}</td>
                          <td className="px-2 py-1 align-top border-r border-slate-200">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] ${STATUS_STYLES[hist.status]}`}>
                              {hist.status}
                            </span>
                          </td>
                          <td className="px-2 py-1 align-top text-slate-700 border-r border-slate-200 text-[12px]">{hist.date}</td>
                          <td className="px-2 py-1 align-top text-slate-700">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openAddRemark(app)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 text-green-600 transition hover:bg-green-200"
                                title="Add remark"
                              >
                                <Plus size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRemark(app.id, hist.historyId)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-red-100 text-red-600 transition hover:bg-red-200"
                                title="Delete remark"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    : null
                )
              }
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Items Per Page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {filteredData.length === 0 ? '0' : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-600 min-w-[60px] text-center">
                Page {filteredData.length === 0 ? 0 : currentPage} of {Math.ceil(filteredData.length / itemsPerPage) || 1}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(Math.ceil(filteredData.length / itemsPerPage), currentPage + 1))}
                disabled={currentPage >= Math.ceil(filteredData.length / itemsPerPage)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Filter Report</h2>
                <p className="mt-1 text-sm text-slate-500">Use filters to narrow down records.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">City</label>
                <select
                  value={filterCity}
                  onChange={(event) => setFilterCity(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Cities</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Source</label>
                <select
                  value={filterSource}
                  onChange={(event) => setFilterSource(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Sources</option>
                  {SOURCES.map((source) => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                <select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                >
                  <option value="">All Status</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Date Range</label>
                <div className="mt-2 flex gap-2">
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(event) => setFilterStartDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(event) => setFilterEndDate(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setFilterCity('');
                  setFilterSource('');
                  setFilterStatus('');
                  setFilterStartDate('');
                  setFilterEndDate('');
                }}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddRemarkOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Add Remark</h2>
                <p className="mt-1 text-sm text-slate-500">Add a new follow-up remark for {selectedApplication.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRemarkOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Remarks</label>
                <textarea
                  value={newRemark.remarks}
                  onChange={(event) => setNewRemark({ ...newRemark, remarks: event.target.value })}
                  placeholder="Enter follow-up remark..."
                  rows="4"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Status</label>
                  <select
                    value={newRemark.status}
                    onChange={(event) => setNewRemark({ ...newRemark, status: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Date</label>
                  <input
                    type="date"
                    value={newRemark.date}
                    onChange={(event) => setNewRemark({ ...newRemark, date: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-[0.24em] text-slate-500">Time</label>
                  <input
                    type="time"
                    value={newRemark.time}
                    onChange={(event) => setNewRemark({ ...newRemark, time: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAddRemarkOpen(false)}
                className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddRemark}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Add Remark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
