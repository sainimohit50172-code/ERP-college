
import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaDownload, FaFileImport, FaPlus, FaPrint, FaBed, FaDoorOpen, FaExchangeAlt } from 'react-icons/fa';
import {
  useBulkExport,
  useBulkImport,
  useCreateResource,
  useResourceList,
} from '../hooks/useResourceHooks';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';

const statusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Available', label: 'Available' },
  { value: 'Occupied', label: 'Occupied' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Vacant', label: 'Vacant' },
];

const sortOptions = [
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Floor', label: 'Floor' },
  { value: 'Room', label: 'Room' },
  { value: 'Status', label: 'Status' },
];

const defaultRoomValues = {
  hostelId: '',
  floor: '1',
  roomNumber: '',
  capacity: '2',
  status: 'Available',
};

const defaultAllocationValues = {
  studentId: '',
  roomId: '',
  bedNumber: '1',
  status: 'Occupied',
};

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export default function HostelManagementPage() {
  const importInputRef = useRef(null);

  const { data: hostelsData } = useResourceList('hostels', { page: 1, pageSize: 200 });
  const { data: hostelRoomsData } = useResourceList('hostelRooms', { page: 1, pageSize: 200 });
  const { data: hostelAllocationsData } = useResourceList('hostelAllocations', { page: 1, pageSize: 200 });
  const { data: hostelVisitorsData } = useResourceList('hostelVisitors', { page: 1, pageSize: 200 });
  const { data: hostelFeesData } = useResourceList('hostelFees', { page: 1, pageSize: 200 });
  const { data: hostelComplaintsData } = useResourceList('hostelComplaints', { page: 1, pageSize: 200 });
  const { data: hostelWardensData } = useResourceList('hostelWardens', { page: 1, pageSize: 200 });
  const { data: maintenanceRequestsData } = useResourceList('maintenanceRequests', { page: 1, pageSize: 200 });
  const { data: roomInspectionsData } = useResourceList('roomInspections', { page: 1, pageSize: 200 });
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });

  const hostels = hostelsData?.items || [];
  const hostelRooms = hostelRoomsData?.items || [];
  const hostelAllocations = hostelAllocationsData?.items || [];
  const hostelVisitors = hostelVisitorsData?.items || [];
  const hostelFees = hostelFeesData?.items || [];
  const hostelComplaints = hostelComplaintsData?.items || [];
  const hostelWardens = hostelWardensData?.items || [];
  const maintenanceRequests = maintenanceRequestsData?.items || [];
  const _roomInspections = roomInspectionsData?.items || [];
  const students = studentsData?.items || [];

  const createHostelRoom = useCreateResource('hostelRooms');
  const createHostelAllocation = useCreateResource('hostelAllocations');
  const importHostelRooms = useBulkImport('hostelRooms');
  const exportHostelRooms = useBulkExport('hostelRooms');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Hostel');
  const [page, setPage] = useState(1);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);

  const {
    register: registerRoom,
    handleSubmit: handleSubmitRoom,
    reset: resetRoom,
    formState: { errors: roomErrors },
  } = useForm({ defaultValues: defaultRoomValues });

  const {
    register: registerAllocation,
    handleSubmit: handleSubmitAllocation,
    reset: resetAllocation,
    formState: { errors: allocationErrors },
  } = useForm({ defaultValues: defaultAllocationValues });

  const hostelMap = useMemo(
    () => new Map(hostels.map((hostel) => [hostel.id, hostel.name || hostel.code || `Hostel ${hostel.id}`])),
    [hostels]
  );
  const roomMap = useMemo(
    () => new Map(hostelRooms.map((room) => [room.id, room.roomNumber || `${room.hostelId}-${room.floor}-${room.id}`])),
    [hostelRooms]
  );
  const studentMap = useMemo(
    () => new Map(students.map((student) => [student.id, student.name || student.enrollmentNo || student.id])),
    [students]
  );

  const totalHostels = hostels.length;
  const totalRooms = hostelRooms.length;
  const totalBeds = hostelRooms.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0);
  const occupiedBeds = hostelAllocations.filter((allocation) => allocation.status === 'Occupied').length;
  const vacantBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyPercent = totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const feeDue = hostelFees.reduce((sum, fee) => sum + (Number(fee.amountDue) || 0), 0);
  const visitorsToday = hostelVisitors.filter((visitor) => isToday(visitor.visitDate || visitor.date)).length;
  const complaintCount = hostelComplaints.length;

  const filteredRooms = useMemo(() => {
    const sortedRooms = [...hostelRooms].sort((a, b) => {
      if (sort === 'Floor') return String(a.floor || '').localeCompare(String(b.floor || ''));
      if (sort === 'Room') return String(a.roomNumber || '').localeCompare(String(b.roomNumber || ''));
      if (sort === 'Status') return String(a.status || '').localeCompare(String(b.status || ''));
      const hostelA = hostelMap.get(a.hostelId) || '';
      const hostelB = hostelMap.get(b.hostelId) || '';
      return hostelA.localeCompare(hostelB);
    });

    return sortedRooms.filter((room) => {
      const searchTerm = search.toLowerCase();
      const hostelName = hostelMap.get(room.hostelId) || '';
      const matchesSearch = [room.roomNumber, room.floor, hostelName, room.status]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || room.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [hostelRooms, hostelMap, search, filter, sort]);

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredRooms.length / pageSize));
  const displayedRooms = filteredRooms.slice((page - 1) * pageSize, page * pageSize);

  const recentActivity = useMemo(() => {
    const activities = [];
    hostelAllocations.slice(-3).reverse().forEach((allocation) => {
      activities.push({
        label: `Room allocation for ${studentMap.get(allocation.studentId) || allocation.studentId}`,
        detail: `Room ${roomMap.get(allocation.roomId) || allocation.roomId} • ${allocation.status}`,
      });
    });
    hostels.slice(-2).reverse().forEach((hostel) => {
      activities.push({ label: `Hostel record updated`, detail: hostel.name || `Hostel ${hostel.id}` });
    });
    hostelComplaints.slice(-2).reverse().forEach((complaint) => {
      activities.push({ label: `Complaint logged`, detail: complaint.subject || `Complaint ${complaint.id}` });
    });
    return activities.slice(0, 6);
  }, [hostelAllocations, hostels, hostelComplaints, studentMap, roomMap]);

  const handleImport = (file) => {
    if (!file) return;
    setImportStatus('Importing hostel room records…');
    const formData = new FormData();
    formData.append('file', file);
    importHostelRooms.mutate(formData, {
      onSuccess: () => setImportStatus('Hostel room records imported successfully.'),
      onError: () => setImportStatus('Import failed. Please check the CSV format and try again.'),
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    handleImport(file);
    event.target.value = '';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await exportHostelRooms.mutateAsync();
      downloadBlob(blob, 'hostel-rooms-export.xlsx');
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const onSubmitRoom = (data) => {
    createHostelRoom.mutate({
      ...data,
      hostelId: data.hostelId || hostels[0]?.id || null,
      capacity: Number(data.capacity) || 1,
    }, {
      onSuccess: () => {
        resetRoom(defaultRoomValues);
        setIsRoomModalOpen(false);
        setPage(1);
      },
    });
  };

  const onSubmitAllocation = (data) => {
    createHostelAllocation.mutate({
      ...data,
      studentId: data.studentId || null,
      roomId: data.roomId || null,
      bedNumber: Number(data.bedNumber) || 1,
      status: data.status || 'Occupied',
    }, {
      onSuccess: () => {
        resetAllocation(defaultAllocationValues);
        setIsAllocationModalOpen(false);
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Hostel management"
        subtitle="Manage hostel blocks, rooms, student allotments, attendance and maintenance workflows."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaDownload /> Export rooms
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700"
            >
              <FaFileImport /> Import CSV
            </button>
            <button
              type="button"
              onClick={() => setIsRoomModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
            >
              <FaPlus /> Add room
            </button>
          </div>
        }
      />

      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      <div className="grid gap-6 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total hostels</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalHostels}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Total rooms</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalRooms}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Occupied beds</p>
          <p className="mt-4 text-3xl font-semibold text-white">{occupiedBeds}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Vacant beds</p>
          <p className="mt-4 text-3xl font-semibold text-white">{vacantBeds}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Occupancy %</p>
          <p className="mt-4 text-3xl font-semibold text-white">{occupancyPercent}%</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Hostel fee due</p>
          <p className="mt-4 text-3xl font-semibold text-white">${feeDue.toLocaleString()}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Complaints</p>
          <p className="mt-4 text-3xl font-semibold text-white">{complaintCount}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Visitors today</p>
          <p className="mt-4 text-3xl font-semibold text-white">{visitorsToday}</p>
        </div>
      </div>

      {importStatus && (
        <div className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-200">{importStatus}</div>
      )}

      <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Room registry</h2>
            <p className="text-sm text-slate-400">Search rooms, manage floor allocation and keep bed assignments updated.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={statusOptions} />
            <div className="flex items-center gap-2">
              <label className="text-sm uppercase tracking-[0.2em] text-slate-400">Sort</label>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none focus:border-sky-400"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={['Hostel', 'Floor', 'Room', 'Capacity', 'Status', 'Occupied Beds', 'Actions']}
            rows={displayedRooms.length > 0 ? displayedRooms.map((room) => [
              <div key={room.id} className="space-y-1">
                <p className="font-semibold text-white">{hostelMap.get(room.hostelId) || room.hostelId}</p>
                <p className="text-sm text-slate-400">{room.block || 'Block A'}</p>
              </div>,
              room.floor || '1',
              room.roomNumber || `R-${room.id}`,
              room.capacity || '0',
              <StatusBadge key={`${room.id}-status`} status={room.status || 'Available'} />,
              `${room.occupiedBeds ?? Math.min(room.capacity || 0, 0)}/${room.capacity || 0}`,
              <div key={`${room.id}-actions`} className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setIsAllocationModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700">Allot</button>
                <button type="button" onClick={handlePrint} className="rounded-3xl bg-slate-800/80 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700">Slip</button>
              </div>,
            ]) : [[
              <div key="empty" className="col-span-7 py-10 text-center text-slate-400">No hostel rooms found. Add a room or import room records to get started.</div>,
            ]]}
          />
        </div>

        <div className="mt-6"><TablePagination page={page} pageCount={pageCount} onPageChange={setPage} /></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Room transfer</p>
          <p className="mt-4 text-3xl font-semibold text-white">{hostelAllocations.filter((allocation) => allocation.transferRequested).length}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Wardens</p>
          <p className="mt-4 text-3xl font-semibold text-white">{hostelWardens.length}</p>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Maintenance pending</p>
          <p className="mt-4 text-3xl font-semibold text-white">{maintenanceRequests.filter((request) => request.status !== 'Completed').length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-white">Quick actions</h3>
              <p className="text-sm text-slate-400">Manage room allotments, transfers and visitor slips quickly.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <button onClick={() => setIsAllocationModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-700"><FaBed className="mr-2 inline-block" /> Allocate room</button>
            <button onClick={() => setIsAllocationModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-700"><FaExchangeAlt className="mr-2 inline-block" /> Transfer student</button>
            <button onClick={() => setIsAllocationModalOpen(true)} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-700"><FaDoorOpen className="mr-2 inline-block" /> Vacate room</button>
            <button onClick={handlePrint} className="rounded-3xl bg-slate-800/80 px-4 py-3 text-left text-sm text-slate-200 transition hover:bg-slate-700"><FaPrint className="mr-2 inline-block" /> Print allocation slip</button>
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white">Visitor register</h3>
          <p className="mt-2 text-sm text-slate-400">Track on-campus visitors and guard check-ins.</p>
          <div className="mt-6 space-y-4">
            {hostelVisitors.slice(0, 4).map((visitor) => (
              <div key={visitor.id} className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
                <p className="font-semibold text-white">{visitor.name || 'Unknown visitor'}</p>
                <p className="text-sm text-slate-400">{visitor.purpose || 'Visit'} • {visitor.visitDate || visitor.date || 'Unknown date'}</p>
              </div>
            ))}
            {!hostelVisitors.length && <p className="text-sm text-slate-400">No visitors registered yet.</p>}
          </div>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-white">Activity timeline</h3>
          <p className="mt-2 text-sm text-slate-400">Recent hostel events and audit entries.</p>
          <div className="mt-6 space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
              <div key={index} className="rounded-3xl border border-white/10 bg-slate-950/90 p-4">
                <p className="font-semibold text-white">{activity.label}</p>
                <p className="text-sm text-slate-400">{activity.detail}</p>
              </div>
            )) : <p className="text-sm text-slate-400">No recent activity to display.</p>}
          </div>
        </div>
      </div>

      <Modal
        title="Add hostel room"
        isOpen={isRoomModalOpen}
        onClose={() => setIsRoomModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmitRoom(onSubmitRoom)}
            className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Save room
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Hostel">
            <select
              {...registerRoom('hostelId', { required: 'Hostel is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select hostel</option>
              {hostels.map((hostel) => (
                <option key={hostel.id} value={hostel.id}>{hostel.name || hostel.code || `Hostel ${hostel.id}`}</option>
              ))}
            </select>
            {roomErrors.hostelId && <p className="mt-1 text-sm text-rose-400">{roomErrors.hostelId.message}</p>}
          </FormField>
          <FormField label="Floor">
            <input
              type="text"
              {...registerRoom('floor', { required: 'Floor is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="1"
            />
            {roomErrors.floor && <p className="mt-1 text-sm text-rose-400">{roomErrors.floor.message}</p>}
          </FormField>
          <FormField label="Room number">
            <input
              type="text"
              {...registerRoom('roomNumber', { required: 'Room number is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="101"
            />
            {roomErrors.roomNumber && <p className="mt-1 text-sm text-rose-400">{roomErrors.roomNumber.message}</p>}
          </FormField>
          <FormField label="Capacity">
            <input
              type="number"
              {...registerRoom('capacity', { required: 'Capacity is required', min: { value: 1, message: 'Capacity must be at least 1' } })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="2"
            />
            {roomErrors.capacity && <p className="mt-1 text-sm text-rose-400">{roomErrors.capacity.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...registerRoom('status')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Vacant">Vacant</option>
            </select>
          </FormField>
        </form>
      </Modal>

      <Modal
        title="Allocate or transfer student"
        isOpen={isAllocationModalOpen}
        onClose={() => setIsAllocationModalOpen(false)}
        footer={
          <button
            type="button"
            onClick={handleSubmitAllocation(onSubmitAllocation)}
            className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300"
          >
            Save allocation
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Student">
            <select
              {...registerAllocation('studentId', { required: 'Student is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.name || student.enrollmentNo}</option>
              ))}
            </select>
            {allocationErrors.studentId && <p className="mt-1 text-sm text-rose-400">{allocationErrors.studentId.message}</p>}
          </FormField>
          <FormField label="Room">
            <select
              {...registerAllocation('roomId', { required: 'Room is required' })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="">Select room</option>
              {hostelRooms.map((room) => (
                <option key={room.id} value={room.id}>{`${hostelMap.get(room.hostelId) || room.hostelId} • ${room.roomNumber || room.id}`}</option>
              ))}
            </select>
            {allocationErrors.roomId && <p className="mt-1 text-sm text-rose-400">{allocationErrors.roomId.message}</p>}
          </FormField>
          <FormField label="Bed number">
            <input
              type="number"
              {...registerAllocation('bedNumber', { required: 'Bed number is required', min: { value: 1, message: 'Bed number must be at least 1' } })}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
              placeholder="1"
            />
            {allocationErrors.bedNumber && <p className="mt-1 text-sm text-rose-400">{allocationErrors.bedNumber.message}</p>}
          </FormField>
          <FormField label="Status">
            <select
              {...registerAllocation('status')}
              className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400"
            >
              <option value="Occupied">Occupied</option>
              <option value="Vacant">Vacant</option>
            </select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}
