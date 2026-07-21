import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Building2,
  Eye,
  Home,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const initialRooms = [
  { id: 1, hostelName: 'Boys Hostel A', block: 'A', floor: '1', roomNumber: 'A-101', roomType: 'Single', capacity: '1', occupied: '1', available: '0', gender: 'Male', warden: 'Rajesh Kumar', contactNumber: '9876543210', status: 'Full', remarks: 'Allocated to first-year students.' },
  { id: 2, hostelName: 'Boys Hostel A', block: 'A', floor: '2', roomNumber: 'A-201', roomType: 'Double', capacity: '2', occupied: '2', available: '0', gender: 'Male', warden: 'Rajesh Kumar', contactNumber: '9876543210', status: 'Full', remarks: 'High occupancy for hostel residents.' },
  { id: 3, hostelName: 'Boys Hostel B', block: 'B', floor: '1', roomNumber: 'B-102', roomType: 'Triple', capacity: '3', occupied: '3', available: '0', gender: 'Male', warden: 'Amit Singh', contactNumber: '9876543211', status: 'Full', remarks: 'Used for postgraduate student intake.' },
  { id: 4, hostelName: 'Girls Hostel A', block: 'C', floor: '1', roomNumber: 'C-101', roomType: 'Single', capacity: '1', occupied: '1', available: '0', gender: 'Female', warden: 'Sunita Sharma', contactNumber: '9876543212', status: 'Full', remarks: 'Reserved for senior female students.' },
  { id: 5, hostelName: 'Girls Hostel A', block: 'C', floor: '2', roomNumber: 'C-202', roomType: 'Double', capacity: '2', occupied: '1', available: '1', gender: 'Female', warden: 'Sunita Sharma', contactNumber: '9876543212', status: 'Available', remarks: 'Ready for new allocation.' },
  { id: 6, hostelName: 'Girls Hostel B', block: 'D', floor: '1', roomNumber: 'D-101', roomType: 'Dormitory', capacity: '6', occupied: '5', available: '1', gender: 'Female', warden: 'Pooja Verma', contactNumber: '9876543213', status: 'Available', remarks: 'Shared dormitory for first-year girls.' },
  { id: 7, hostelName: 'Research Hostel', block: 'A', floor: '3', roomNumber: 'A-301', roomType: 'Single', capacity: '1', occupied: '1', available: '0', gender: 'Mixed', warden: 'Nitin Rawat', contactNumber: '9876543214', status: 'Full', remarks: 'Dedicated to research scholars.' },
  { id: 8, hostelName: 'Research Hostel', block: 'A', floor: '3', roomNumber: 'A-302', roomType: 'Double', capacity: '2', occupied: '2', available: '0', gender: 'Mixed', warden: 'Nitin Rawat', contactNumber: '9876543214', status: 'Full', remarks: 'Reserved for doctoral students.' },
  { id: 9, hostelName: 'International Hostel', block: 'B', floor: '2', roomNumber: 'B-201', roomType: 'Double', capacity: '2', occupied: '1', available: '1', gender: 'Mixed', warden: 'Meera Joshi', contactNumber: '9876543215', status: 'Available', remarks: 'High demand for visiting scholars.' },
  { id: 10, hostelName: 'International Hostel', block: 'B', floor: '2', roomNumber: 'B-202', roomType: 'Triple', capacity: '3', occupied: '2', available: '1', gender: 'Mixed', warden: 'Meera Joshi', contactNumber: '9876543215', status: 'Available', remarks: 'Flexible occupancy for short stay guests.' },
  { id: 11, hostelName: 'Boys Hostel A', block: 'A', floor: '4', roomNumber: 'A-401', roomType: 'Single', capacity: '1', occupied: '0', available: '1', gender: 'Male', warden: 'Rajesh Kumar', contactNumber: '9876543210', status: 'Available', remarks: 'Vacant room for new allocation.' },
  { id: 12, hostelName: 'Boys Hostel B', block: 'B', floor: '2', roomNumber: 'B-202', roomType: 'Double', capacity: '2', occupied: '2', available: '0', gender: 'Male', warden: 'Amit Singh', contactNumber: '9876543211', status: 'Full', remarks: 'Currently assigned to second-year students.' },
  { id: 13, hostelName: 'Girls Hostel B', block: 'D', floor: '2', roomNumber: 'D-202', roomType: 'Single', capacity: '1', occupied: '1', available: '0', gender: 'Female', warden: 'Pooja Verma', contactNumber: '9876543213', status: 'Full', remarks: 'Allocated to student council members.' },
  { id: 14, hostelName: 'Girls Hostel A', block: 'C', floor: '3', roomNumber: 'C-301', roomType: 'Double', capacity: '2', occupied: '1', available: '1', gender: 'Female', warden: 'Sunita Sharma', contactNumber: '9876543212', status: 'Maintenance', remarks: 'Minor plumbing repair pending.' },
  { id: 15, hostelName: 'Research Hostel', block: 'A', floor: '4', roomNumber: 'A-401', roomType: 'Dormitory', capacity: '6', occupied: '4', available: '2', gender: 'Mixed', warden: 'Nitin Rawat', contactNumber: '9876543214', status: 'Available', remarks: 'Shared room for research scholars.' },
  { id: 16, hostelName: 'International Hostel', block: 'B', floor: '3', roomNumber: 'B-301', roomType: 'Single', capacity: '1', occupied: '1', available: '0', gender: 'Mixed', warden: 'Meera Joshi', contactNumber: '9876543215', status: 'Full', remarks: 'Allocated to visiting faculty.' },
  { id: 17, hostelName: 'Boys Hostel A', block: 'A', floor: '5', roomNumber: 'A-501', roomType: 'Triple', capacity: '3', occupied: '2', available: '1', gender: 'Male', warden: 'Rajesh Kumar', contactNumber: '9876543210', status: 'Available', remarks: 'Ready for room change requests.' },
  { id: 18, hostelName: 'Girls Hostel B', block: 'D', floor: '3', roomNumber: 'D-301', roomType: 'Double', capacity: '2', occupied: '2', available: '0', gender: 'Female', warden: 'Pooja Verma', contactNumber: '9876543213', status: 'Full', remarks: 'Fully occupied for the semester.' },
  { id: 19, hostelName: 'Boys Hostel B', block: 'B', floor: '3', roomNumber: 'B-303', roomType: 'Dormitory', capacity: '6', occupied: '4', available: '2', gender: 'Male', warden: 'Amit Singh', contactNumber: '9876543211', status: 'Available', remarks: 'Open for temporary student assignments.' },
  { id: 20, hostelName: 'International Hostel', block: 'B', floor: '4', roomNumber: 'B-401', roomType: 'Single', capacity: '1', occupied: '0', available: '1', gender: 'Mixed', warden: 'Meera Joshi', contactNumber: '9876543215', status: 'Inactive', remarks: 'Scheduled for renovation.' },
];

const emptyForm = {
  hostelName: '',
  block: '',
  floor: '',
  roomNumber: '',
  roomType: 'Single',
  capacity: '',
  occupied: '',
  available: '',
  gender: 'Male',
  warden: '',
  contactNumber: '',
  status: 'Available',
  remarks: '',
};

function getStatusClasses(status) {
  switch (status) {
    case 'Available':
      return 'bg-emerald-100 text-emerald-700';
    case 'Full':
      return 'bg-rose-100 text-rose-700';
    case 'Maintenance':
      return 'bg-amber-100 text-amber-700';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function InstituteHostelPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState(initialRooms);
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const filteredRooms = useMemo(() => {
    const term = search.toLowerCase();
    return rooms.filter((room) => {
      const matchesText = [room.hostelName, room.block, room.roomNumber, room.warden]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
      const matchesBlock = blockFilter === 'All' || room.block === blockFilter;
      const matchesType = typeFilter === 'All' || room.roomType === typeFilter;
      const matchesGender = genderFilter === 'All' || room.gender === genderFilter;
      const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
      return matchesText && matchesBlock && matchesType && matchesGender && matchesStatus;
    });
  }, [rooms, search, blockFilter, typeFilter, genderFilter, statusFilter]);

  const blockOptions = ['All', ...Array.from(new Set(rooms.map((room) => room.block)))];
  const typeOptions = ['All', ...Array.from(new Set(rooms.map((room) => room.roomType)))];
  const genderOptions = ['All', 'Male', 'Female', 'Mixed'];
  const statusOptions = ['All', 'Available', 'Full', 'Maintenance', 'Inactive'];

  const summaryCards = [
    { label: 'Total Hostels', value: new Set(rooms.map((room) => room.hostelName)).size, icon: Building2, route: '/settings/institute/hostels/list' },
    { label: 'Total Rooms', value: rooms.length, icon: Home, route: '/settings/institute/hostels/rooms' },
    { label: 'Occupied Rooms', value: rooms.filter((room) => room.status === 'Full').length, icon: BedDouble, route: '/settings/institute/hostels/occupied' },
    { label: 'Available Rooms', value: rooms.filter((room) => room.status === 'Available').length, icon: Home, route: '/settings/institute/hostels/available' },
    { label: 'Students Allocated', value: rooms.reduce((sum, room) => sum + Number(room.occupied || 0), 0), icon: Users, route: '/settings/institute/hostels/students' },
    { label: 'Wardens', value: new Set(rooms.map((room) => room.warden)).size, icon: Building2, route: '/settings/institute/hostels/wardens' },
  ];

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.hostelName.trim()) errors.hostelName = 'Hostel name is required';
    if (!form.block.trim()) errors.block = 'Block is required';
    if (!form.floor.trim()) errors.floor = 'Floor is required';
    if (!form.roomNumber.trim()) errors.roomNumber = 'Room number is required';
    if (!form.roomType.trim()) errors.roomType = 'Room type is required';
    if (!form.capacity.trim()) errors.capacity = 'Capacity is required';
    if (!form.occupied.trim()) errors.occupied = 'Occupied count is required';
    if (!form.available.trim()) errors.available = 'Available count is required';
    if (!form.gender.trim()) errors.gender = 'Gender is required';
    if (!form.warden.trim()) errors.warden = 'Warden is required';
    if (!form.contactNumber.trim()) errors.contactNumber = 'Contact number is required';
    if (!form.status.trim()) errors.status = 'Status is required';
    return errors;
  };

  const handleAddSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    const nextRoom = {
      id: Date.now(),
      hostelName: form.hostelName.trim(),
      block: form.block.trim(),
      floor: form.floor.trim(),
      roomNumber: form.roomNumber.trim(),
      roomType: form.roomType.trim(),
      capacity: form.capacity.trim(),
      occupied: form.occupied.trim(),
      available: form.available.trim(),
      gender: form.gender,
      warden: form.warden.trim(),
      contactNumber: form.contactNumber.trim(),
      status: form.status,
      remarks: form.remarks.trim(),
    };

    setRooms((current) => [nextRoom, ...current]);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      return;
    }

    setRooms((current) => current.map((room) => (room.id === selectedRoom.id ? { ...room, ...form, hostelName: form.hostelName.trim(), block: form.block.trim(), floor: form.floor.trim(), roomNumber: form.roomNumber.trim(), roomType: form.roomType.trim(), capacity: form.capacity.trim(), occupied: form.occupied.trim(), available: form.available.trim(), gender: form.gender, warden: form.warden.trim(), contactNumber: form.contactNumber.trim(), status: form.status, remarks: form.remarks.trim() } : room)));
    setIsEditOpen(false);
    setSelectedRoom(null);
    resetForm();
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setForm({
      hostelName: room.hostelName,
      block: room.block,
      floor: room.floor,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      occupied: room.occupied,
      available: room.available,
      gender: room.gender,
      warden: room.warden,
      contactNumber: room.contactNumber,
      status: room.status,
      remarks: room.remarks,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const confirmDelete = (room) => {
    setDeleteTarget(room);
    setIsDeleteOpen(true);
  };

  const removeRoom = () => {
    if (!deleteTarget) return;
    setRooms((current) => current.filter((room) => room.id !== deleteTarget.id));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleImport = () => {
    const importedRoom = {
      id: Date.now(),
      hostelName: 'Imported Hostel',
      block: 'E',
      floor: '1',
      roomNumber: 'E-101',
      roomType: 'Double',
      capacity: '2',
      occupied: '1',
      available: '1',
      gender: 'Mixed',
      warden: 'Imported Warden',
      contactNumber: '9876543333',
      status: 'Available',
      remarks: 'Imported from the current session.',
    };
    setRooms((current) => [importedRoom, ...current]);
  };

  const handleExport = () => {
    const csvRows = [
      ['Hostel Name', 'Block', 'Floor', 'Room Number', 'Room Type', 'Capacity', 'Occupied', 'Available', 'Gender', 'Warden', 'Status'],
      ...filteredRooms.map((room) => [room.hostelName, room.block, room.floor, room.roomNumber, room.roomType, room.capacity, room.occupied, room.available, room.gender, room.warden, room.status]),
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'hostel-rooms.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const refreshFilters = () => {
    setSearch('');
    setBlockFilter('All');
    setTypeFilter('All');
    setGenderFilter('All');
    setStatusFilter('All');
  };

  return (
    <div className="mx-[10px] space-y-6">
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mt-3">
              <Breadcrumb
                items={[
                  { label: 'Settings', to: '/settings' },
                  { label: 'Institute Setup', to: '/settings/institute' },
                  { label: 'Hostel' },
                ]}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Hostel Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage hostel blocks, rooms, room categories, capacity and hostel settings from one centralized workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Hostel overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Available Hostel Rooms</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
          >
            <Plus className="h-4 w-4" /> Add Hostel
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => navigate(item.route)}
                className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 text-left shadow-sm transition hover-gradient-border"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover-gradient-border">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search hostel name"
              className="w-full bg-transparent outline-none sm:w-56"
            />
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <select value={blockFilter} onChange={(event) => setBlockFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {blockOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Blocks' : option}</option>)}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {typeOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Room Types' : option}</option>)}
            </select>
            <select value={genderFilter} onChange={(event) => setGenderFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {genderOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Gender' : option}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {statusOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Status' : option}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" onClick={handleImport} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <Plus className="h-4 w-4" /> Import
          </button>
          <button type="button" onClick={handleExport} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <Sparkles className="h-4 w-4" /> Export
          </button>
          <button type="button" onClick={refreshFilters} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
            <thead>
              <tr className="bg-emerald-600 text-left uppercase tracking-[0.12em] text-white">
                <th className="px-4 py-4">#</th>
                <th className="px-4 py-4">Hostel Name</th>
                <th className="px-4 py-4">Block</th>
                <th className="px-4 py-4">Floor</th>
                <th className="px-4 py-4">Room Number</th>
                <th className="px-4 py-4">Room Type</th>
                <th className="px-4 py-4">Capacity</th>
                <th className="px-4 py-4">Occupied</th>
                <th className="px-4 py-4">Available</th>
                <th className="px-4 py-4">Gender</th>
                <th className="px-4 py-4">Warden</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {filteredRooms.map((room, index) => (
                <tr key={room.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                  <td className="px-4 py-4 text-slate-700">{room.hostelName}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.block}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.floor}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.roomNumber}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.roomType}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.capacity}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.occupied}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.available}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.gender}</td>
                  <td className="whitespace-nowrap px-4 py-4">{room.warden}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusClasses(room.status)}`}>{room.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button type="button" title="View" aria-label="View" onClick={() => { setSelectedRoom(room); setIsViewOpen(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover-gradient-border">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" title="Edit" aria-label="Edit" onClick={() => openEditModal(room)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" title="Delete" aria-label="Delete" onClick={() => confirmDelete(room)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel setup</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Add hostel</h3>
              </div>
              <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAddSubmit}>
              {[
                ['hostelName', 'Hostel Name'],
                ['block', 'Block'],
                ['floor', 'Floor'],
                ['roomNumber', 'Room Number'],
                ['roomType', 'Room Type'],
                ['capacity', 'Capacity'],
                ['occupied', 'Occupied'],
                ['available', 'Available'],
                ['warden', 'Warden'],
                ['contactNumber', 'Contact Number'],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                  />
                  {formErrors[field] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field]}</p> : null}
                </label>
              ))}

              <label className="text-sm font-medium text-slate-700">
                Gender
                <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Mixed">Mixed</option>
                </select>
                {formErrors.gender ? <p className="mt-1 text-xs text-rose-500">{formErrors.gender}</p> : null}
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Available">Available</option>
                  <option value="Full">Full</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
                {formErrors.status ? <p className="mt-1 text-xs text-rose-500">{formErrors.status}</p> : null}
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Remarks
                <textarea value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} rows="3" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                  <Plus className="h-4 w-4" /> Save
                </button>
                <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel setup</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Edit hostel</h3>
              </div>
              <button type="button" onClick={() => { setIsEditOpen(false); setSelectedRoom(null); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              {[
                ['hostelName', 'Hostel Name'],
                ['block', 'Block'],
                ['floor', 'Floor'],
                ['roomNumber', 'Room Number'],
                ['roomType', 'Room Type'],
                ['capacity', 'Capacity'],
                ['occupied', 'Occupied'],
                ['available', 'Available'],
                ['warden', 'Warden'],
                ['contactNumber', 'Contact Number'],
              ].map(([field, label]) => (
                <label key={field} className="text-sm font-medium text-slate-700">
                  {label}
                  <input
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border"
                  />
                  {formErrors[field] ? <p className="mt-1 text-xs text-rose-500">{formErrors[field]}</p> : null}
                </label>
              ))}

              <label className="text-sm font-medium text-slate-700">
                Gender
                <select value={form.gender} onChange={(event) => setForm((current) => ({ ...current, gender: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Available">Available</option>
                  <option value="Full">Full</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Remarks
                <textarea value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} rows="3" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                  Save changes
                </button>
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedRoom(null); resetForm(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Hostel details</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedRoom.hostelName}</h3>
              </div>
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ['Block', selectedRoom.block],
                ['Floor', selectedRoom.floor],
                ['Room Number', selectedRoom.roomNumber],
                ['Room Type', selectedRoom.roomType],
                ['Capacity', selectedRoom.capacity],
                ['Occupied', selectedRoom.occupied],
                ['Available', selectedRoom.available],
                ['Gender', selectedRoom.gender],
                ['Warden', selectedRoom.warden],
                ['Contact Number', selectedRoom.contactNumber],
                ['Status', selectedRoom.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Remarks</p>
                <p className="mt-2 text-sm text-slate-700">{selectedRoom.remarks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Delete hostel</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Remove {deleteTarget.roomNumber}?</h3>
            <p className="mt-3 text-sm text-slate-600">This action will remove the room from the current hostel view.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={removeRoom} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 hover-gradient-border">Delete</button>
              <button type="button" onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
