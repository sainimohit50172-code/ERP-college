import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Book, Clock, RefreshCw, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import EmptyState from '../ui/EmptyState.jsx';
import DataTable from '../ui/DataTable.jsx';
import Modal from '../ui/Modal.jsx';

const demoIssued = [];
const demoOverdue = [];
const demoMostIssued = [
  { name: 'Introduction to Algorithms', count: 34 },
  { name: 'Discrete Mathematics', count: 21 },
  { name: 'Operating Systems', count: 18 },
  { name: 'Database Systems', count: 14 },
];

export default function LibraryDashboard() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [booksModalOpen, setBooksModalOpen] = useState(false);
  const [circulationModalOpen, setCirculationModalOpen] = useState(false);
  const [issuedRow, setIssuedRow] = useState(null);

  const barData = useMemo(() => demoMostIssued, []);

  return (
    <div style={{ margin: 10 }} className="min-h-[300px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Library</h1>
        <div className="inline-flex items-center gap-3">
          <div className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Library Session 2026-27 Odd</div>
          <button type="button" onClick={() => setRefreshTick((t) => t + 1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Section 1: Summary Cards */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#fef3c7,#fde68a,#fef08a)' }}>
          <div className="rounded-[17px] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Books Count</h3>
              <button onClick={() => setBooksModalOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">View</button>
            </div>
            <div className="mt-4 space-y-3">
              <button onClick={() => setBooksModalOpen(true)} className="w-full rounded-2xl bg-yellow-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 0.8, loop: Infinity }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <BookOpen className="h-6 w-6 text-amber-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">Total Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-yellow-200 text-amber-700">-</div>
                </div>
              </button>

              <div className="w-full rounded-2xl bg-yellow-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div whileHover={{ scale: 1.08 }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <Book className="h-6 w-6 text-amber-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">New Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-yellow-400 text-white">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#e9d5ff,#c7b3ff)' }}>
          <div className="rounded-[17px] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Books Issued</h3>
              <button onClick={() => setRefreshTick((t) => t + 1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">Refresh</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="w-full rounded-2xl bg-violet-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div whileHover={{ rotate: 6 }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <BookOpen className="h-6 w-6 text-violet-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">Today's Issued Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-violet-300 text-white">-</div>
                </div>
              </div>

              <div className="w-full rounded-2xl bg-violet-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div whileHover={{ rotate: -6 }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <Book className="h-6 w-6 text-violet-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">Today's Returned Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-violet-500 text-white">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-[1px] rounded-[18px]" style={{ background: 'linear-gradient(90deg,#bbf7d0,#99f6e4)' }}>
          <div className="rounded-[17px] bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Books Circulation</h3>
              <button onClick={() => setCirculationModalOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">View</button>
            </div>
            <div className="mt-4 space-y-3">
              <div className="w-full rounded-2xl bg-emerald-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div animate={{ x: [0, 6, -6, 0] }} transition={{ duration: 1.6, loop: Infinity }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <Book className="h-6 w-6 text-emerald-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">Circulated Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-emerald-400 text-white">-</div>
                </div>
              </div>

              <div className="w-full rounded-2xl bg-emerald-50 p-4 text-left hover:shadow-md transition flex items-center gap-4">
                <motion.div animate={{ rotate: [0, 90, 180, 270, 360] }} transition={{ duration: 2, loop: Infinity }} className="h-12 w-12 flex-none rounded-lg bg-white/60 flex items-center justify-center shadow-sm">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </motion.div>
                <div>
                  <div className="text-sm text-slate-600">Over Due Books</div>
                  <div className="mt-1 text-2xl font-bold">-</div>
                </div>
                <div className="ml-auto">
                  <div className="inline-flex h-8 w-20 items-center justify-center rounded-md bg-emerald-500 text-white">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Issued Books and Top Overdue */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <div className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Issued Books</h3>
            <div className="mt-4">
              <DataTable
                columns={[{ label: 'Book', key: 'book', render: (v) => v.name }, 'IssuedTo', 'IssueDate', 'ReturnDate', { label: 'Status', key: 'status' }]}
                rows={demoIssued}
                tableMaxHeight={360}
                headerClassName="bg-slate-900 text-white"
                onRowClick={(r) => setIssuedRow(r)}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Top Overdue Books</h3>
            <div className="mt-4 max-h-[360px] overflow-y-auto space-y-3">
              {demoOverdue.length === 0 ? (
                <EmptyState title="No Overdue Books" description="No overdue books to display." />
              ) : (
                demoOverdue.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 hover:shadow-md transition">
                    <div className="h-12 w-12 flex-none rounded-md bg-slate-100" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900">{d.name}</div>
                      <div className="text-xs text-slate-500">{d.student} • {d.days} days overdue</div>
                    </div>
                    <div className="ml-auto text-sm font-semibold text-rose-600">₹{d.fine}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Charts and Users */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Most Issued Books</h3>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700"><Download className="h-4 w-4" /> PNG</button>
              <button onClick={() => setRefreshTick((t) => t + 1)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">Refresh</button>
            </div>
          </div>
          <div className="mt-4 h-72">
            {barData.length === 0 ? (
              <EmptyState title="No Data Found" description="No issued books data available." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 20, bottom: 30 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200/70 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Users With Books</h3>
          <div className="mt-4 max-h-[360px] overflow-y-auto space-y-3">
            <EmptyState title="No Users" description="No users with books found." />
          </div>
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-[#6B7280] font-medium">© 2026 HARIDWAR UNIVERSITY - Campus Automation Partner</div>

      <Modal title="Books Details" isOpen={booksModalOpen} onClose={() => setBooksModalOpen(false)}>
        <p>Demo books details will appear here.</p>
      </Modal>

      <Modal title="Circulation Details" isOpen={circulationModalOpen} onClose={() => setCirculationModalOpen(false)}>
        <p>Demo circulation details.</p>
      </Modal>

      <Modal title="Issued Row" isOpen={!!issuedRow} onClose={() => setIssuedRow(null)}>
        <pre className="text-xs">{JSON.stringify(issuedRow, null, 2)}</pre>
      </Modal>
    </div>
  );
}
