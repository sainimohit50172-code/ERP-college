import { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaPrint, FaSearch } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useTranscripts } from '../hooks/useTranscripts';
import { useERP } from '../services/ERPContext.jsx';
export default function TranscriptPage() {
  const [search, setSearch] = useState('');
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [format, setFormat] = useState('pdf');
  const [page, _setPage] = useState(1);
  const pageSize = 10;
  const { data, isLoading, error, exportTranscript } = useTranscripts({ page, pageSize, search });
  const { setNotifications } = useERP();
  const transcripts = data?.items || [];
  useEffect(() => {
    if (!selectedTranscript && transcripts.length > 0) setSelectedTranscript(transcripts[0]);
  }, [transcripts, selectedTranscript]);
  const filteredTranscripts = useMemo(() => {
    const term = (search || '').toLowerCase();
    if (!term) return transcripts;
    return transcripts.filter((t) => (t.student || '').toLowerCase().includes(term) || (t.rollNo || '').toLowerCase().includes(term));
  }, [transcripts, search]);
  if (isLoading) return <div>Loading...</div>;
  if (error) {
    setNotifications((n) => [...(n || []), { type: 'error', message: 'Failed to load transcripts' }]);
    return <div>Error loading transcripts</div>;
  }
  const onDownload = async (transcript) => {
    try {
      if (format === 'print') {
        window.print();
        return;
      }
      const blob = await exportTranscript.mutateAsync({ id: transcript.id, format });
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const fileType = format === 'excel' ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/pdf';
      const url = window.URL.createObjectURL(new Blob([blob], { type: fileType }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript-${transcript.rollNo || transcript.id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setNotifications((n) => [...(n || []), { type: 'success', message: `Transcript downloaded as ${format.toUpperCase()}` }]);
    } catch (err) {
      setNotifications((n) => [...(n || []), { type: 'error', message: 'Transcript download failed' }]);
      console.error('Transcript download failed', err);
    }
  };
  return (
    <div className="space-y-8">
      <SectionHeader title="Academic transcripts" subtitle="Generate and manage official academic transcripts for students." />
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student Selection */}
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm lg:col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">Select student</h3>
          <div className="relative mb-4">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/70 pl-10 pr-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTranscripts.map((transcript) => (
              <button
                key={transcript.id}
                onClick={() => setSelectedTranscript(transcript)}
                className={`w-full text-left rounded-3xl px-4 py-3 transition ${
                  selectedTranscript?.id === transcript.id ? 'bg-sky-400/20 border border-sky-400' : 'bg-slate-800/50 border border-white/5 hover:bg-slate-800'
                }`}
              >
                <p className="font-semibold text-white">{transcript.student}</p>
                <p className="text-sm text-slate-400">{transcript.rollNo} • {transcript.program?.split(' ')[0]}</p>
              </button>
            ))}
          </div>
        </div>
        {/* Transcript Display */}
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-5 shadow-sm lg:col-span-2">
          <div className="text-center mb-8 pb-6 border-b border-white/10">
            <div className="mb-4 text-2xl font-bold text-sky-400">University of Excellence</div>
            <h2 className="text-xl font-semibold text-white mb-1">Official Academic Transcript</h2>
            <p className="text-sm text-slate-400">Original For Student Records</p>
          </div>
          {selectedTranscript ? (
            <>
              <div className="mb-8 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Student Name</p>
                  <p className="text-lg font-semibold text-white">{selectedTranscript.student}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Roll Number</p>
                  <p className="text-lg font-semibold text-white">{selectedTranscript.rollNo}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Program</p>
                  <p className="text-lg font-semibold text-white">{selectedTranscript.program}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400 mb-1">Duration</p>
                  <p className="text-lg font-semibold text-white">{selectedTranscript.duration}</p>
                </div>
              </div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Academic Record</h3>
                {selectedTranscript.semesters?.map((semester) => (
                  <div key={semester.sem} className="mb-6">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-white font-semibold">Semester {semester.sem}</h4>
                      <div className="text-sm">
                        <span className="text-slate-400">SGPA: </span>
                        <span className="font-semibold text-sky-300">{semester.sgpa}</span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left px-4 py-2 text-slate-400 font-semibold">Subject</th>
                            <th className="text-center px-4 py-2 text-slate-400 font-semibold">Grade</th>
                            <th className="text-center px-4 py-2 text-slate-400 font-semibold">Credits</th>
                          </tr>
                        </thead>
                        <tbody>
                          {semester.subjects?.map((subject, idx) => (
                            <tr key={idx} className="border-b border-white/5">
                              <td className="px-4 py-2 text-white">{subject.name}</td>
                              <td className="px-4 py-2 text-center">
                                <div className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${subject.grade === 'A' ? 'bg-emerald-400/10 text-emerald-300' : subject.grade === 'B' ? 'bg-blue-400/10 text-blue-300' : 'bg-amber-400/10 text-amber-300'}`}>
                                  {subject.grade}
                                </div>
                              </td>
                              <td className="px-4 py-2 text-center text-slate-300">{subject.credits}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-8 p-4 rounded-2xl bg-slate-950/50 border border-white/5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1">Total Credits</p>
                    <p className="text-2xl font-bold text-white">{selectedTranscript.totalCredits}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1">CGPA</p>
                    <p className="text-2xl font-bold text-sky-400">{selectedTranscript.cgpa}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-slate-400 mb-1">Status</p>
                    <p className="text-lg font-semibold text-emerald-400">{selectedTranscript.status}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400">
                  <option value="pdf">PDF Format</option>
                  <option value="excel">Excel Format</option>
                  <option value="print">Print</option>
                </select>
                <button onClick={() => {
                  window.print();
                  setNotifications((n) => [...(n || []), { type: 'success', message: 'Print dialog opened for transcript' }]);
                }} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  <FaPrint /> Print
                </button>
                <button onClick={() => onDownload(selectedTranscript)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaDownload /> Download
                </button>
              </div>
            </>
          ) : (
            <div className="text-slate-400">No transcript selected</div>
          )}
        </div>
      </div>
    </div>
  );
}