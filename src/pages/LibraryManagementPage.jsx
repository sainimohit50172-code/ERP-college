import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import ViewButton from '../components/ui/ViewButton.jsx';
import { useResourceList } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { createBook, listBooks, updateBook, deleteBook } from '../services/bookService.js';
import { issueBook as issueLibraryBook, returnBook as returnLibraryBook, listIssueRecords } from '../services/issueService.js';
import { collectFine, listFineRecords } from '../services/fineService.js';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'Issued', label: 'Issued' },
  { value: 'Reserved', label: 'Reserved' },
  { value: 'Overdue', label: 'Overdue' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Lost', label: 'Lost' },
];

const defaultBookValues = {
  title: '',
  author: '',
  isbn: '',
  barcode: '',
  accessionNumber: '',
  category: 'General',
  publisher: '',
  copies: 1,
  availableCopies: 1,
  lostCopies: 0,
  damagedCopies: 0,
  status: 'Available',
  borrowerId: '',
  dueDate: '',
};

export default function LibraryManagementPage() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [fines, setFines] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [activeBook, setActiveBook] = useState(null);
  const pageSize = 6;

  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const students = studentsData?.items || [];
  const { data: teachersData } = useResourceList('teachers', { page: 1, pageSize: 200 });
  const teachers = teachersData?.items || [];

  const borrowerMap = useMemo(() => {
    const map = new Map();
    students.forEach((student) => map.set(`student-${student.id}`, `${student.name} (Student)`));
    teachers.forEach((teacher) => map.set(`teacher-${teacher.id}`, `${teacher.name} (Staff)`));
    return map;
  }, [students, teachers]);

  const refreshLibraryData = async () => {
    const [bookResponse, issueResponse, fineResponse] = await Promise.all([
      listBooks({ page: 1, pageSize: 200 }),
      listIssueRecords({ page: 1, pageSize: 200 }),
      listFineRecords({ page: 1, pageSize: 200 }),
    ]);
    setBooks(bookResponse?.items || []);
    setIssues(issueResponse?.items || []);
    setFines(fineResponse?.items || []);
  };

  useEffect(() => {
    refreshLibraryData();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultBookValues });

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const searchTerm = search.toLowerCase();
      const borrowerName = borrowerMap.get(book.borrowerId) || '';
      const matchesSearch = [book.title, book.author, book.isbn, book.barcode, book.accessionNumber, book.category, borrowerName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || book.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [books, search, filter, borrowerMap]);

  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const displayedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);
  const totalBooks = books.length;
  const issuedBooks = books.filter((book) => book.status === 'Issued' || book.status === 'Reserved').length;
  const availableBooks = books.filter((book) => book.status === 'Available').length;
  const overdueBooks = books.filter((book) => book.status === 'Overdue').length;
  const collectedFines = fines.reduce((sum, fine) => sum + Number(fine.amount || 0), 0);

  const resetForm = () => reset(defaultBookValues);

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      copies: Number(data.copies || 1),
      availableCopies: Number(data.availableCopies || data.copies || 1),
      lostCopies: Number(data.lostCopies || 0),
      damagedCopies: Number(data.damagedCopies || 0),
      borrowerId: data.borrowerId || null,
      dueDate: data.status === 'Available' ? null : data.dueDate || null,
    };
    await createBook(payload);
    resetForm();
    setPage(1);
    setIsModalOpen(false);
    refreshLibraryData();
  };

  const onIssueSubmit = async (data) => {
    await issueLibraryBook({ ...data, bookId: activeBook?.id, memberId: data.memberId, dueDate: data.dueDate });
    await updateBook(activeBook.id, { status: 'Issued', borrowerId: `member-${data.memberId}`, dueDate: data.dueDate });
    setIsIssueModalOpen(false);
    setActiveBook(null);
    refreshLibraryData();
  };

  const onReturnBook = async (book) => {
    await returnLibraryBook(book.id, { returnedAt: new Date().toISOString() });
    await updateBook(book.id, { status: 'Available', borrowerId: null, dueDate: null });
    refreshLibraryData();
  };

  const onCollectFine = async (book) => {
    await collectFine({ bookId: book.id, memberId: book.borrowerId, amount: 25, reason: 'Late return', status: 'Collected' });
    refreshLibraryData();
  };

  const onDeleteBook = async (book) => {
    await deleteBook(book.id);
    refreshLibraryData();
  };

  const openIssueModal = (book) => {
    setActiveBook(book);
    setIsIssueModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Library management"
        subtitle="Track book inventory, circulation status, borrowing, fines and overdue alerts."
        action={
          <WithPermission moduleKey="library" action="create">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              <FaPlus /> Add book
            </button>
          </WithPermission>
        }
      />
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total books</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalBooks}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Available</p>
          <p className="mt-4 text-3xl font-semibold text-white">{availableBooks}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Issued</p>
          <p className="mt-4 text-3xl font-semibold text-white">{issuedBooks}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overdue / Fines</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overdueBooks} / ₹{collectedFines}</p>
        </div>
      </div>
      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Book inventory</h2>
            <p className="text-sm text-slate-400">Search books, filter circulation status and review borrower details.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
          </div>
        </div>
        <div className="mt-6">
          <DataTable
            columns={[
              { label: 'Title', key: 'title', minWidth: '220px' },
              { label: 'ISBN', key: 'isbn', minWidth: '140px' },
              { label: 'Barcode', key: 'barcode', minWidth: '140px' },
              { label: 'Copies', key: 'copies', minWidth: '90px' },
              { label: 'Available', key: 'available', minWidth: '90px' },
              { label: 'Status', key: 'status', minWidth: '90px' },
              { label: 'Actions', key: 'actions', minWidth: '120px' },
            ]}
            rows={displayedBooks.map((book) => [
              <div key={book.id} className="space-y-1">
                <p className="font-semibold text-white">{book.title}</p>
                <p className="text-sm text-slate-400">{book.author || '—'}</p>
              </div>,
              book.isbn || '—',
              book.barcode || '—',
              book.copies || 1,
              book.availableCopies || 0,
              <StatusBadge key={`${book.id}-status`} status={book.status || 'Available'} />,
              <div key={`${book.id}-actions`} className="flex items-center gap-2">
                <ViewButton
                  title="View book"
                  ariaLabel="View book"
                  className="h-8 w-8 rounded-full bg-sky-400 text-slate-950 hover:opacity-90"
                  onClick={() => openIssueModal(book)}
                />
                <button aria-label="Return" onClick={() => onReturnBook(book)} className="h-8 w-8 flex items-center justify-center rounded-full bg-emerald-400 text-slate-950 hover:opacity-90"><FaEdit /></button>
                <button aria-label="Fine" onClick={() => onCollectFine(book)} className="h-8 w-8 flex items-center justify-center rounded-full bg-amber-400 text-slate-950 hover:opacity-90"><FaEdit /></button>
                <button aria-label="Delete" onClick={() => onDeleteBook(book)} className="h-8 w-8 flex items-center justify-center rounded-full bg-rose-400 text-slate-950 hover:opacity-90"><FaTrash /></button>
              </div>,
            ])}
          />
        </div>
        <div className="mt-6">
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-white">Circulation & fines</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-slate-200">Issue register</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {issues.slice(0, 5).map((issue) => <li key={issue.id}>#{issue.id} · {issue.bookId} · {issue.memberId}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-slate-200">Fine register</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-400">
              {fines.slice(0, 5).map((fine) => <li key={fine.id}>₹{fine.amount} · {fine.reason || 'Late return'}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <Modal
        title="Add new library book"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Save book
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Title">
            <input type="text" {...register('title', { required: 'Title is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Advanced Database Systems" />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Author">
            <input type="text" {...register('author', { required: 'Author is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Dr. Neha Verma" />
            {errors.author && <p className="mt-1 text-sm text-rose-400">{errors.author.message}</p>}
          </FormField>
          <FormField label="ISBN">
            <input type="text" {...register('isbn')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="978-1-4028-9462-6" />
          </FormField>
          <FormField label="Barcode">
            <input type="text" {...register('barcode')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="LIB-1001" />
          </FormField>
          <FormField label="Accession number">
            <input type="text" {...register('accessionNumber')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="ACC-001" />
          </FormField>
          <FormField label="Publisher">
            <input type="text" {...register('publisher')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Pearson" />
          </FormField>
          <FormField label="Category">
            <input type="text" {...register('category')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Computer Science" />
          </FormField>
          <FormField label="Copies">
            <input type="number" min="1" {...register('copies')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Available copies">
            <input type="number" min="0" {...register('availableCopies')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Lost copies">
            <input type="number" min="0" {...register('lostCopies')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Damaged copies">
            <input type="number" min="0" {...register('damagedCopies')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Status">
            <select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
              <option value="Reserved">Reserved</option>
              <option value="Overdue">Overdue</option>
              <option value="Damaged">Damaged</option>
              <option value="Lost">Lost</option>
            </select>
          </FormField>
          <FormField label="Borrower">
            <select {...register('borrowerId')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              <option value="">None</option>
              {students.map((student) => <option key={`student-${student.id}`} value={`student-${student.id}`}>{student.name} (Student)</option>)}
              {teachers.map((teacher) => <option key={`teacher-${teacher.id}`} value={`teacher-${teacher.id}`}>{teacher.name} (Staff)</option>)}
            </select>
          </FormField>
          <FormField label="Due date">
            <input type="date" {...register('dueDate')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
        </form>
      </Modal>

      <Modal
        title={`Issue ${activeBook?.title || 'book'}`}
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        footer={
          <button type="button" onClick={handleSubmit(onIssueSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            Issue book
          </button>
        }
      >
        <form className="grid gap-5">
          <FormField label="Member ID">
            <input type="text" {...register('memberId', { required: 'Member ID is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="STU-1001" />
          </FormField>
          <FormField label="Due date">
            <input type="date" {...register('dueDate')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}