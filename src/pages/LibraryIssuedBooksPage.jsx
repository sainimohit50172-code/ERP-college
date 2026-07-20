import { useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const initialBooks = [
  { id: 1, title: 'Introduction to Algorithms', code: 'LIB-001', issuedTo: 'Rahul Sharma', issueDate: '2026-06-01', dueDate: '2026-06-21', fine: '0', status: 'Returned' },
  { id: 2, title: 'Database System Concepts', code: 'LIB-002', issuedTo: 'Priya Singh', issueDate: '2026-06-10', dueDate: '2026-06-30', fine: '50', status: 'Issued' },
  { id: 3, title: 'Clean Code', code: 'LIB-003', issuedTo: 'Anjali Mehta', issueDate: '2026-05-12', dueDate: '2026-06-02', fine: '200', status: 'Overdue' },
  { id: 4, title: 'Principles of Marketing', code: 'LIB-004', issuedTo: 'Vikas Patel', issueDate: '2026-06-18', dueDate: '2026-07-08', fine: '0', status: 'Issued' },
  { id: 5, title: 'Physics for Engineers', code: 'LIB-005', issuedTo: 'Sunita Rao', issueDate: '2026-06-22', dueDate: '2026-07-12', fine: '0', status: 'Returned' },
];

const statusClasses = {
  Returned: 'bg-emerald-50 text-emerald-700',
  Issued: 'bg-amber-100 text-amber-800',
  Overdue: 'bg-red-100 text-red-700',
};

const statuses = ['All', 'Issued', 'Returned', 'Overdue'];

export default function LibraryIssuedBooksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [fineAmount, setFineAmount] = useState('');
  const [items, setItems] = useState(initialBooks);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredItems = useMemo(() => {
    return items.filter((book) => {
      const matchesStatus = selectedStatus === 'All' || book.status === selectedStatus;
      const matchesSearch = [book.title, book.issuedTo].some((value) => value.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [items, searchTerm, selectedStatus]);

  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleApplyFine = () => {
    if (!fineAmount) return;
    setItems((current) => current.map((book) => {
      if (selectedStatus === 'All' || book.status === selectedStatus) {
        return { ...book, fine: fineAmount };
      }
      return book;
    }));
    setFineAmount('');
  };

  const handleReturn = (id) => {
    setItems((current) => current.map((book) => book.id === id ? { ...book, status: 'Returned', fine: '0' } : book));
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="min-h-[calc(100vh-88px)] bg-[#F8FAFC] p-6 font-sans text-slate-900">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Dashboard &gt; Issued Books</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Issued Books</h1>
      </div>

      <div className="mb-6 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.8fr_1fr_0.9fr] xl:grid-cols-[2fr_1fr_0.9fr]">
          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#64748B]">Search</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className="inline-flex items-center justify-center rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Go
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#64748B]">Book Status</label>
            <select
              value={selectedStatus}
              onChange={(event) => { setSelectedStatus(event.target.value); setCurrentPage(1); }}
              className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#64748B]">Enter Fine Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Fine amount"
                value={fineAmount}
                onChange={(event) => setFineAmount(event.target.value)}
                className="w-full rounded-xl border border-[#E2E8F0] bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={handleApplyFine}
                className="inline-flex items-center justify-center rounded-lg bg-[#1E293B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 hover-gradient-border"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        {paginatedItems.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-slate-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <BookOpen size={28} />
            </div>
            <p className="text-lg font-semibold">No Records Found</p>
            <p className="text-sm text-slate-500">Try adjusting your search or filter to see issued books.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F8FAFC] text-left text-xs uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Book Code</th>
                  <th className="px-4 py-3">Issued To</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Fine Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((book) => (
                  <tr key={book.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-4 font-semibold text-slate-900">{book.title}</td>
                    <td className="px-4 py-4 text-slate-700">{book.code}</td>
                    <td className="px-4 py-4 text-slate-700">{book.issuedTo}</td>
                    <td className="px-4 py-4 text-slate-700">{book.issueDate}</td>
                    <td className="px-4 py-4 text-slate-700">{book.dueDate}</td>
                    <td className="px-4 py-4 text-slate-700">₹{book.fine}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${statusClasses[book.status]}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {(book.status === 'Issued' || book.status === 'Overdue') ? (
                        <button
                          type="button"
                          onClick={() => handleReturn(book.id)}
                          className="rounded-lg border border-[#1E293B] px-3 py-2 text-xs font-semibold text-[#1E293B] transition hover:bg-slate-50"
                        >
                          Mark as Returned
                        </button>
                      ) : (
                        <span className="text-sm text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <div className="text-sm text-slate-500">Showing {paginatedItems.length} of {filteredItems.length} records</div>
          <div className="inline-flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <div className="inline-flex items-center gap-2">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePageChange(index + 1)}
                  className={`inline-flex h-10 min-w-[38px] items-center justify-center rounded-lg px-3 text-sm font-semibold transition ${currentPage === index + 1 ? 'bg-[#1E293B] text-white' : 'border border-[#E2E8F0] bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
