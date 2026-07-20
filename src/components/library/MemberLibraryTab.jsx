import { useMemo, useState } from 'react';
import { useResourceList } from '../../hooks/useResourceHooks';
import { issueBook as issueLibraryBook, returnBook as returnLibraryBook, renewIssue as renewLibraryIssue } from '../../services/issueService.js';
import { listBooks, createReservation as reserveBook } from '../../services/bookService.js';
import { collectFine } from '../../services/fineService.js';
import WithPermission from '../../components/auth/WithPermission.jsx';
import Modal from '../../components/ui/Modal.jsx';
import FormField from '../../components/forms/FormField.jsx';

export default function MemberLibraryTab({ memberId, memberType = 'student' }) {
  const [search, setSearch] = useState('');
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const { data: issuesData } = useResourceList('libraryIssues', { page: 1, pageSize: 500 });
  const { data: booksData } = useResourceList('libraryBooks', { page: 1, pageSize: 1000 });
  const { data: finesData } = useResourceList('libraryFines', { page: 1, pageSize: 500 });

  const issues = issuesData?.items || [];
  const books = booksData?.items || [];
  const fines = finesData?.items || [];

  const memberIssues = useMemo(() => issues.filter((i) => String(i.memberId) === String(memberId)), [issues, memberId]);
  const activeLoans = memberIssues.filter((i) => i.status === 'Issued' || i.status === 'Overdue');
  const loanHistory = memberIssues.filter((i) => i.status === 'Returned');
  const lostBooks = memberIssues.filter((i) => i.status === 'Lost');
  const damaged = books.filter((b) => b.damagedCopies && b.damagedCopies > 0 && String(b.lastBorrowerId) === String(memberId));
  const reservations = (useResourceList('libraryReservations', { page: 1, pageSize: 500 }).data?.items || []).filter((r) => String(r.memberId) === String(memberId));
  const memberFines = fines.filter((f) => String(f.memberId) === String(memberId) && f.status !== 'Refunded');
  const outstandingFine = memberFines.reduce((s, f) => s + Number(f.amount || 0), 0);

  const membershipStatus = 'Active';
  const borrowLimit = memberType === 'teacher' ? 10 : 3;
  const booksIssued = activeLoans.length;
  const remainingCapacity = Math.max(0, borrowLimit - booksIssued);
  const lastActivityDate = memberIssues.sort((a, b) => new Date(b.updatedAt || b.issuedAt || b.createdAt) - new Date(a.updatedAt || a.issuedAt || a.createdAt))[0]?.updatedAt || null;

  // Issue modal is opened directly via `setIsIssueOpen(true)` in UI buttons

  const doIssueBook = async (bookId, dueDate) => {
    await issueLibraryBook({ bookId, memberId, dueDate });
    await listBooks();
    setIsIssueOpen(false);
  };

  const doReturn = async (issue) => {
    await returnLibraryBook(issue.id, { returnedAt: new Date().toISOString() });
  };

  const doRenew = async (issue) => {
    try {
      await renewLibraryIssue(issue.id, { loanDays: 14 });
    } catch (e) {
      // ignore for UI; service throws on ineligible renewals
    }
  };

  const doReserve = async (bookId) => {
    await reserveBook({ bookId, memberId });
  };

  const doPayFine = async (fine) => {
    await collectFine({ bookId: fine.bookId, memberId, amount: fine.amount, reason: fine.reason, status: 'Collected' });
  };

  const filteredBooks = books.filter((b) => {
    const term = search.toLowerCase();
    if (!term) return true;
    return [b.title, b.isbn, b.barcode, b.accessionNumber].filter(Boolean).some((f) => String(f).toLowerCase().includes(term));
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
      <div className="card p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover-gradient-border">
        <h3 className="text-sm font-semibold text-slate-900">Library Member</h3>
        <p className="mt-2 text-sm text-slate-600">ID: {memberId}</p>
        <p className="mt-1 text-sm text-slate-600">Status: {membershipStatus}</p>
        <p className="mt-1 text-sm text-slate-600">Borrow limit: {borrowLimit}</p>
        <p className="mt-1 text-sm text-slate-600">Books issued: {booksIssued}</p>
        <p className="mt-1 text-sm text-slate-600">Reserved: {reservations.length}</p>
        <p className="mt-1 text-sm text-slate-600">Overdue: {activeLoans.filter(l => l.status === 'Overdue').length}</p>
        <p className="mt-1 text-sm text-slate-600">Outstanding fine: ₹{outstandingFine}</p>
        <p className="mt-1 text-sm text-slate-600">Remaining capacity: {remainingCapacity}</p>
        <p className="mt-1 text-sm text-slate-600">Last activity: {lastActivityDate ? new Date(lastActivityDate).toLocaleString() : 'N/A'}</p>
        <div className="mt-4 grid gap-2">
          <WithPermission moduleKey="library" action="create"><button onClick={() => setIsIssueOpen(true)} className="rounded-2xl bg-sky-400 px-4 py-2 text-sm font-semibold text-slate-900">Issue Book</button></WithPermission>
          <WithPermission moduleKey="library" action="update"><button onClick={() => {}} className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-900">Return Book</button></WithPermission>
          <WithPermission moduleKey="library" action="update"><button onClick={() => {}} className="rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900">Renew Book</button></WithPermission>
          <WithPermission moduleKey="library" action="create"><button onClick={() => {}} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900">Reserve Book</button></WithPermission>
          <WithPermission moduleKey="library" action="update"><button onClick={() => {}} className="rounded-2xl bg-rose-400 px-4 py-2 text-sm font-semibold text-slate-900">Pay Fine</button></WithPermission>
        </div>
      </div>

      <div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between hover-gradient-border">
            <h3 className="text-sm font-semibold text-slate-900">Active loans</h3>
            <div className="text-sm text-slate-500">{activeLoans.length} active</div>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {activeLoans.map((loan) => (
              <li key={loan.id} className="flex items-center justify-between hover-gradient-border">
                <div>
                  <div className="font-semibold">{books.find(b => b.id === loan.bookId)?.title || loan.bookId}</div>
                  <div className="text-xs text-slate-500">Due: {loan.dueDate || 'N/A'}</div>
                </div>
                <div className="flex gap-2">
                  <WithPermission moduleKey="library" action="update"><button onClick={() => doReturn(loan)} className="rounded-2xl bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900">Return</button></WithPermission>
                  <WithPermission moduleKey="library" action="update"><button onClick={() => doRenew(loan)} className="rounded-2xl bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-900">Renew</button></WithPermission>
                </div>
              </li>
            ))}
            {!activeLoans.length && <li className="text-sm text-slate-500">No active loans</li>}
          </ul>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Loan history</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {loanHistory.map((loan) => (
                <li key={loan.id}>#{loan.id} · {books.find(b => b.id === loan.bookId)?.title || loan.bookId} · Returned {loan.returnedAt || 'N/A'}</li>
              ))}
              {!loanHistory.length && <li className="text-sm text-slate-500">No loan history</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Reserved books</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {reservations.map((r) => <li key={r.id}>{books.find(b => b.id === r.bookId)?.title || r.bookId} · {r.status}</li>)}
              {!reservations.length && <li className="text-sm text-slate-500">No reservations</li>}
            </ul>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Lost books</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {lostBooks.map((l) => <li key={l.id}>{books.find(b => b.id === l.bookId)?.title || l.bookId} · Reported {l.updatedAt || l.createdAt}</li>)}
              {!lostBooks.length && <li className="text-sm text-slate-500">No lost books</li>}
            </ul>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Damaged books</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {damaged.map((d) => <li key={d.id}>{d.title} · Damaged copies: {d.damagedCopies}</li>)}
              {!damaged.length && <li className="text-sm text-slate-500">No damaged books</li>}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Fines</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {memberFines.map((f) => (
              <li key={f.id} className="flex items-center justify-between hover-gradient-border">
                <div>₹{f.amount} · {f.reason || 'Fine'}</div>
                <div>
                  <WithPermission moduleKey="library" action="update"><button onClick={() => doPayFine(f)} className="rounded-2xl bg-emerald-400 px-3 py-1 text-xs font-semibold text-slate-900">Pay</button></WithPermission>
                </div>
              </li>
            ))}
            {!memberFines.length && <li className="text-sm text-slate-500">No outstanding fines</li>}
          </ul>
        </div>

        <Modal title={`Issue book to ${memberId}`} isOpen={isIssueOpen} onClose={() => setIsIssueOpen(false)} footer={null}>
          <div className="grid gap-3">
            <FormField label="Search books">
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-2xl border px-3 py-2" />
            </FormField>
            <div className="max-h-60 overflow-auto">
              {filteredBooks.map((b) => (
                <div key={b.id} className="flex items-center justify-between border-b py-2 hover-gradient-border">
                  <div>
                    <div className="font-semibold">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.isbn || b.barcode}</div>
                  </div>
                  <div>
                    <button onClick={() => doIssueBook(b.id, null)} className="rounded-2xl bg-sky-400 px-3 py-1 text-xs font-semibold">Issue</button>
                    <button onClick={() => doReserve(b.id)} className="ml-2 rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold">Reserve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
