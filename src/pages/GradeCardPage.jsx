import { useEffect, useMemo, useState } from 'react';
import { FaDownload, FaSearch } from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import { useGradeCards } from '../hooks/useGradeCards';
import { listResults } from '../services/resultService.js';
export default function GradeCardPage() {
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [page, _setPage] = useState(1);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const pageSize = 5;
  const { data, isLoading, error, recalculateGradeCard } = useGradeCards({ page, pageSize, search, filter: 'All' });
  const gradeCards = data?.items || [];
  const resultRecords = listResults().items;
  useEffect(() => {
    if (!selectedCard && gradeCards.length > 0) {
      setSelectedCard(gradeCards[0]);
    }
  }, [gradeCards, selectedCard]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return gradeCards;
    return gradeCards.filter((g) => [g.student, g.rollNo, g.subject, g.course].some((v) => (v || '').toLowerCase().includes(term)));
  }, [gradeCards, search]);
  const handleRecalculate = async () => {
    if (!selectedCard) return;
    try {
      setIsRecalculating(true);
      await recalculateGradeCard.mutateAsync(selectedCard.id);
    } catch (err) {
      console.error('Failed to recalculate grade card', err);
    } finally {
      setIsRecalculating(false);
    }
  };
  if (isLoading) return <div>Loading...</div>;
  if (error) {
    console.error('Failed to load grade cards', error);
    return <div>Error loading grade cards</div>;
  }
  return (
    <div className="space-y-8">
      <SectionHeader title="Grade cards" subtitle="View student grade cards with subject-wise breakdown and GPA/CGPA." />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Result records</p>
          <p className="mt-3 text-2xl font-semibold text-white">{resultRecords.length}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Published</p>
          <p className="mt-3 text-2xl font-semibold text-white">{resultRecords.filter((item) => item.published).length}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Average score</p>
          <p className="mt-3 text-2xl font-semibold text-white">{resultRecords.length ? Math.round(resultRecords.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / resultRecords.length) : 0}%</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
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
            {filtered.map((card) => (
              <button
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`w-full text-left rounded-3xl px-4 py-3 transition ${selectedCard?.id === card.id ? 'bg-sky-400/20 border border-sky-400' : 'bg-slate-800/50 border border-white/5 hover:bg-slate-800'}`}>
                <p className="font-semibold text-white">{card.student}</p>
                <p className="text-sm text-slate-400">{card.rollNo} • Sem {card.semester}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm lg:col-span-2">
          {selectedCard ? (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedCard.student}</h2>
                  <p className="text-sm text-slate-400">Roll No: {selectedCard.rollNo} • Semester {selectedCard.semester}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button onClick={handleRecalculate} disabled={isRecalculating} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 hover-gradient-border">
                    {isRecalculating ? 'Recalculating...' : 'Recalculate GPA'}
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700 hover-gradient-border">
                    <FaDownload /> Download
                  </button>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Subject Marks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left px-4 py-3 text-slate-400 font-semibold">Subject</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">Internal</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">Practical</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">External</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">Total</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">Grade</th>
                        <th className="text-center px-4 py-3 text-slate-400 font-semibold">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCard.subjects?.map((subject, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 text-white font-medium">{subject.subject}</td>
                          <td className="px-4 py-3 text-center text-slate-300">{subject.internal}</td>
                          <td className="px-4 py-3 text-center text-slate-300">{subject.practical}</td>
                          <td className="px-4 py-3 text-center text-slate-300">{subject.external}</td>
                          <td className="px-4 py-3 text-center font-semibold text-sky-300">{subject.total}</td>
                          <td className="px-4 py-3 text-center">
                            <div className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${subject.grade === 'A' ? 'bg-emerald-400/10 text-emerald-300' : subject.grade === 'B' ? 'bg-blue-400/10 text-blue-300' : subject.grade === 'C' ? 'bg-amber-400/10 text-amber-300' : 'bg-rose-400/10 text-rose-300'}`}>
                              {subject.grade}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-slate-300">{subject.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Semester GPA</p>
                  <p className="mt-2 text-3xl font-bold text-sky-400">{selectedCard.gpa}</p>
                </div>
                <div className="rounded-[28px] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Cumulative GPA</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-400">{selectedCard.cgpa}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-slate-400">No grade card selected</div>
          )}
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Grading Scale</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="rounded-2xl bg-emerald-400/10 px-4 py-3 border border-emerald-400/20">
            <p className="text-sm text-slate-400">Grade A</p>
            <p className="text-white font-semibold">85% - 100%</p>
          </div>
          <div className="rounded-2xl bg-blue-400/10 px-4 py-3 border border-blue-400/20">
            <p className="text-sm text-slate-400">Grade B</p>
            <p className="text-white font-semibold">75% - 84%</p>
          </div>
          <div className="rounded-2xl bg-amber-400/10 px-4 py-3 border border-amber-400/20">
            <p className="text-sm text-slate-400">Grade C</p>
            <p className="text-white font-semibold">65% - 74%</p>
          </div>
          <div className="rounded-2xl bg-orange-400/10 px-4 py-3 border border-orange-400/20">
            <p className="text-sm text-slate-400">Grade D</p>
            <p className="text-white font-semibold">55% - 64%</p>
          </div>
          <div className="rounded-2xl bg-rose-400/10 px-4 py-3 border border-rose-400/20">
            <p className="text-sm text-slate-400">Grade F</p>
            <p className="text-white font-semibold">Below 55%</p>
          </div>
        </div>
      </div>
    </div>
  );
}