import { useMemo, useState } from 'react';
import { FaDownload, FaPlus } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { useResourceList, useCreateResource } from '../hooks/useResourceHooks';
import { usePermissions } from '../services/permissionHelpers.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import WithPermission from '../components/auth/WithPermission.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useERP } from '../services/ERPContext.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function ClassroomManagementPage() {
  const { data: classroomsData } = useResourceList('classrooms', { page: 1, pageSize: 200 });
  const classrooms = classroomsData?.items || [];
  const createClassroom = useCreateResource('classrooms');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const perms = usePermissions();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { roomNumber: '', building: 'Academic Block A', capacity: '60', hasProjector: true, hasLab: false, hasAC: true, floor: '1', status: 'Active' },
  });

  const filteredClassrooms = useMemo(() => {
    return classrooms.filter((classroom) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [classroom.roomNumber, classroom.building, classroom.floor].some((value) => value.toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || classroom.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [classrooms, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredClassrooms.length / pageSize));
  const displayedClassrooms = filteredClassrooms.slice((page - 1) * pageSize, page * pageSize);

  const onSubmit = (data) => {
    createClassroom(data);
    reset({ roomNumber: '', building: 'Academic Block A', capacity: '60', hasProjector: true, hasLab: false, hasAC: true, floor: '1', status: 'Active' });
    setPage(1);
    setIsModalOpen(false);
  };

  const totalClassrooms = classrooms.length;
  const activeRooms = classrooms.filter((c) => c.status === 'Active').length;
  const totalCapacity = classrooms.reduce((acc, c) => acc + parseInt(c.capacity), 0);

  return (
    <div className="space-y-8">
      <SectionHeader title="Classroom management" subtitle="Manage physical classrooms, facilities, capacity and resource allocation." />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total classrooms</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalClassrooms}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Available</p>
          <p className="mt-4 text-3xl font-semibold text-white">{activeRooms}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total capacity</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalCapacity}</p>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Classroom registry</h2>
            <p className="text-sm text-slate-400">Search classrooms by room number or building and manage facilities.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <WithPermission moduleKey="classrooms" action="export">
              <button className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"><FaDownload /> Export</button>
            </WithPermission>
            <WithPermission moduleKey="classrooms" action="create">
              <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"><FaPlus /> Add classroom</button>
            </WithPermission>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2"><SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} /></div>

        <div className="mt-6">
          <DataTable
            columns={['Room', 'Building', 'Floor', 'Capacity', 'Projector', 'Lab', 'AC', 'Status']}
            rows={displayedClassrooms.map((classroom) => [
              <div key={classroom.id} className="font-semibold text-white">{classroom.roomNumber}</div>,
              classroom.building,
              classroom.floor,
              classroom.capacity,
              classroom.hasProjector ? '✓' : '✗',
              classroom.hasLab ? '✓' : '✗',
              classroom.hasAC ? '✓' : '✗',
              <StatusBadge key={`${classroom.id}-status`} status={classroom.status} />,
            ])}
          />
        </div>
        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <Modal title="Add new classroom" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} footer={<button onClick={handleSubmit(onSubmit)} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">Save classroom</button>}>
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Room number"><input type="text" {...register('roomNumber', { required: 'Room number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="A-101" />{errors.roomNumber && <p className="mt-1 text-sm text-rose-400">{errors.roomNumber.message}</p>}</FormField>
          <FormField label="Building"><input type="text" {...register('building', { required: 'Building is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Academic Block A" />{errors.building && <p className="mt-1 text-sm text-rose-400">{errors.building.message}</p>}</FormField>
          <FormField label="Floor"><input type="text" {...register('floor', { required: 'Floor is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="1" />{errors.floor && <p className="mt-1 text-sm text-rose-400">{errors.floor.message}</p>}</FormField>
          <FormField label="Capacity"><input type="number" {...register('capacity', { required: 'Capacity is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="60" />{errors.capacity && <p className="mt-1 text-sm text-rose-400">{errors.capacity.message}</p>}</FormField>
          <FormField label="Projector"><select {...register('hasProjector')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value={true}>Available</option><option value={false}>Not available</option></select></FormField>
          <FormField label="Lab facilities"><select {...register('hasLab')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value={false}>No</option><option value={true}>Yes</option></select></FormField>
          <FormField label="Air conditioning"><select {...register('hasAC')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value={true}>Available</option><option value={false}>Not available</option></select></FormField>
          <FormField label="Status"><select {...register('status', { required: 'Status is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"><option value="Active">Active</option><option value="Maintenance">Maintenance</option><option value="Inactive">Inactive</option></select>{errors.status && <p className="mt-1 text-sm text-rose-400">{errors.status.message}</p>}</FormField>
        </form>
      </Modal>
    </div>
  );
}
