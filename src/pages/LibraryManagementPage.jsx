import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { usePermissions } from '../services/permissionHelpers.js';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'Checked Out', label: 'Checked out' },
  { value: 'Overdue', label: 'Overdue' },
];

const defaultBookValues = {
  title: '',
  author: '',
  isbn: '',
  category: 'General',
  status: 'Available',
  borrowerId: '',
  dueDate: '',
};

export default function LibraryManagementPage() {
  const { data: libraryBooksData } = useResourceList('libraryBooks', { page: 1, pageSize: 200 });
  const libraryBooks = libraryBooksData?.items || [];
  const createLibraryBook = useCreateResource('libraryBooks');

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

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: defaultBookValues });

  const filteredBooks = useMemo(() => {
    return libraryBooks.filter((book) => {
      const searchTerm = search.toLowerCase();
      const borrowerName = borrowerMap.get(book.borrowerId) || '';
      const matchesSearch = [book.title, book.author, book.isbn, book.category, borrowerName]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || book.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [libraryBooks, search, filter, borrowerMap]);

  const pageSize = 6;
  const perms = usePermissions();
  const pageCount = Math.max(1, Math.ceil(filteredBooks.length / pageSize));
  const displayedBooks = filteredBooks.slice((page - 1) * pageSize, page * pageSize);

  const totalBooks = libraryBooks.length;
  const checkedOutBooks = libraryBooks.filter((book) => book.status === 'Checked Out').length;
  const availableBooks = libraryBooks.filter((book) => book.status === 'Available').length;
  const overdueBooks = libraryBooks.filter((book) => book.status === 'Overdue').length;

  const resetForm = () => reset(defaultBookValues);

  const onSubmit = (data) => {
    createLibraryBook.mutate({
      ...data,
      borrowerId: data.borrowerId || null,
      dueDate: data.status === 'Available' ? null : data.dueDate || null,
    }, {
      onSuccess: () => {
        resetForm();
        setPage(1);
        setIsModalOpen(false);
      },
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Library management"
        subtitle="Track book inventory, circulation status, borrowing and overdue alerts."
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
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Checked out</p>
          <p className="mt-4 text-3xl font-semibold text-white">{checkedOutBooks}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Overdue</p>
          <p className="mt-4 text-3xl font-semibold text-white">{overdueBooks}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
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
            columns={['Title', 'Author', 'ISBN', 'Category', 'Status', 'Due date', 'Borrower']}
            rows={displayedBooks.map((book) => [
              <div key={book.id} className="space-y-1">
                <p className="font-semibold text-white">{book.title}</p>
                <p className="text-sm text-slate-400">{book.subtitle || ''}</p>
              </div>,
              book.author || '—',
              book.isbn || '—',
              book.category || 'General',
              <StatusBadge key={`${book.id}-status`} status={book.status || 'Available'} />,
              book.dueDate || '—',
              borrowerMap.get(book.borrowerId) || '—',
            ])}
          />
        </div>

        <div className="mt-6">
          <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
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
            <input
              type="text"
              {...register('title', { required: 'Title is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Advanced Database Systems"
            />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </FormField>
          <FormField label="Author">
            <input
              type="text"
              {...register('author', { required: 'Author is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Dr. Neha Verma"
            />
            {errors.author && <p className="mt-1 text-sm text-rose-400">{errors.author.message}</p>}
          </FormField>
          <FormField label="ISBN">
            <input
              type="text"
              {...register('isbn')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="978-1-4028-9462-6"
            />
          </FormField>
          <FormField label="Category">
            <input
              type="text"
              {...register('category')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="Computer Science"
            />
          </FormField>
          <FormField label="Status">
            <select
              {...register('status')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Available">Available</option>
              <option value="Checked Out">Checked Out</option>
              <option value="Overdue">Overdue</option>
            </select>
          </FormField>
          <FormField label="Borrower">
            <select
              {...register('borrowerId')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">None</option>
              {students.map((student) => (
                <option key={`student-${student.id}`} value={`student-${student.id}`}>
                  {student.name} (Student)
                </option>
              ))}
              {teachers.map((teacher) => (
                <option key={`teacher-${teacher.id}`} value={`teacher-${teacher.id}`}>
                  {teacher.name} (Staff)
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Due date">
            <input
              type="date"
              {...register('dueDate')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            />
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
