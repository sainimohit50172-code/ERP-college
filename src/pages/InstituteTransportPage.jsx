import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  Bus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Fuel,
  MapPinned,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

const helperCards = [
  {
    title: 'Vehicle Management',
    description: 'Manage buses, vans and transport fleet.',
    icon: Bus,
    detailTitle: 'Vehicle Management',
    detailText: 'Coordinate fleet availability, maintenance windows, and operational readiness for every vehicle on campus.',
  },
  {
    title: 'Route Planning',
    description: 'Create and manage transport routes.',
    icon: MapPinned,
    detailTitle: 'Route Planning',
    detailText: 'Define optimized routes, boarding points, travel time, and assigned stops for every pickup zone.',
  },
  {
    title: 'Driver Management',
    description: 'Assign drivers and monitor availability.',
    icon: UserCog,
    detailTitle: 'Driver Management',
    detailText: 'Review driver shift allocation, licensing status, mobile contacts, and assignment history in one place.',
  },
  {
    title: 'Transport Reports',
    description: 'View transport analytics and reports.',
    icon: BarChart3,
    detailTitle: 'Transport Reports',
    detailText: 'Track usage trends, monthly revenue, vehicle health, and transport utilization across all corridors.',
  },
];

const initialVehicles = [
  { id: 1, vehicleNumber: 'HU-01', vehicleName: 'College Bus A', vehicleType: 'Mini Bus', registrationNumber: 'UK07AB1234', driver: 'Amit Kumar', mobile: '9876543210', route: 'Roorkee', capacity: '40', insuranceExpiry: '2026-10-15', fitnessExpiry: '2026-09-10', gpsEnabled: true, status: 'Active', remarks: 'Runs morning and evening shifts.', lastService: '2026-06-10', currentStudents: 34 },
  { id: 2, vehicleNumber: 'HU-02', vehicleName: 'College Bus B', vehicleType: 'College Bus', registrationNumber: 'UK07CD5678', driver: 'Rakesh Singh', mobile: '9876543211', route: 'Haridwar', capacity: '50', insuranceExpiry: '2026-11-20', fitnessExpiry: '2026-10-05', gpsEnabled: true, status: 'Active', remarks: 'Primary route for hostel commuters.', lastService: '2026-06-05', currentStudents: 41 },
  { id: 3, vehicleNumber: 'HU-03', vehicleName: 'City Van 1', vehicleType: 'Van', registrationNumber: 'UK07EF9012', driver: 'Mohit Sharma', mobile: '9876543212', route: 'Bahadrabad', capacity: '20', insuranceExpiry: '2026-08-25', fitnessExpiry: '2026-07-22', gpsEnabled: false, status: 'Maintenance', remarks: 'Under periodic servicing.', lastService: '2026-05-28', currentStudents: 16 },
  { id: 4, vehicleNumber: 'HU-04', vehicleName: 'Electric Bus 1', vehicleType: 'Electric Bus', registrationNumber: 'UK07GH3456', driver: 'Sanjay Verma', mobile: '9876543213', route: 'Laksar', capacity: '30', insuranceExpiry: '2026-12-12', fitnessExpiry: '2026-11-18', gpsEnabled: true, status: 'Reserved', remarks: 'Reserved for special event transport.', lastService: '2026-06-12', currentStudents: 22 },
  { id: 5, vehicleNumber: 'HU-05', vehicleName: 'Executive Van', vehicleType: 'Van', registrationNumber: 'UK07IJ7890', driver: 'Vivek Mehra', mobile: '9876543214', route: 'Manglaur', capacity: '20', insuranceExpiry: '2026-09-03', fitnessExpiry: '2026-08-10', gpsEnabled: true, status: 'Active', remarks: 'Used for student pickup and drop.', lastService: '2026-06-02', currentStudents: 18 },
  { id: 6, vehicleNumber: 'HU-06', vehicleName: 'School Bus 1', vehicleType: 'College Bus', registrationNumber: 'UK07KL2345', driver: 'Neeraj Rawat', mobile: '9876543215', route: 'Bhagwanpur', capacity: '50', insuranceExpiry: '2026-07-30', fitnessExpiry: '2026-07-18', gpsEnabled: true, status: 'Active', remarks: 'High-capacity route for central pickup.', lastService: '2026-06-14', currentStudents: 47 },
  { id: 7, vehicleNumber: 'HU-07', vehicleName: 'City Bus 2', vehicleType: 'Mini Bus', registrationNumber: 'UK07MN6789', driver: 'Deepak Chauhan', mobile: '9876543216', route: 'Roorkee', capacity: '40', insuranceExpiry: '2026-10-08', fitnessExpiry: '2026-09-16', gpsEnabled: false, status: 'Inactive', remarks: 'Not operational due to inspection.', lastService: '2026-05-20', currentStudents: 0 },
  { id: 8, vehicleNumber: 'HU-08', vehicleName: 'Airport Van', vehicleType: 'Van', registrationNumber: 'UK07OP1122', driver: 'Nitin Bhatt', mobile: '9876543217', route: 'Haridwar', capacity: '20', insuranceExpiry: '2026-10-22', fitnessExpiry: '2026-09-27', gpsEnabled: true, status: 'Active', remarks: 'Supports shuttle movement for faculty.', lastService: '2026-06-07', currentStudents: 14 },
  { id: 9, vehicleNumber: 'HU-09', vehicleName: 'College Bus C', vehicleType: 'College Bus', registrationNumber: 'UK07QR3344', driver: 'Kunal Bhandari', mobile: '9876543218', route: 'Bahadrabad', capacity: '50', insuranceExpiry: '2026-11-05', fitnessExpiry: '2026-10-30', gpsEnabled: true, status: 'Active', remarks: 'Serves late evening hostel return trips.', lastService: '2026-06-09', currentStudents: 38 },
  { id: 10, vehicleNumber: 'HU-10', vehicleName: 'Mini Bus 3', vehicleType: 'Mini Bus', registrationNumber: 'UK07ST5566', driver: 'Pawan Negi', mobile: '9876543219', route: 'Laksar', capacity: '40', insuranceExpiry: '2026-08-14', fitnessExpiry: '2026-07-28', gpsEnabled: true, status: 'Maintenance', remarks: 'Tyre replacement scheduled this week.', lastService: '2026-05-30', currentStudents: 21 },
  { id: 11, vehicleNumber: 'HU-11', vehicleName: 'Smart Bus', vehicleType: 'Electric Bus', registrationNumber: 'UK07UV7788', driver: 'Arun Joshi', mobile: '9876543220', route: 'Manglaur', capacity: '30', insuranceExpiry: '2026-12-03', fitnessExpiry: '2026-11-12', gpsEnabled: true, status: 'Active', remarks: 'Used for premium student pickup service.', lastService: '2026-06-11', currentStudents: 29 },
  { id: 12, vehicleNumber: 'HU-12', vehicleName: 'Campus Van', vehicleType: 'Van', registrationNumber: 'UK07WX9900', driver: 'Gaurav Rawat', mobile: '9876543221', route: 'Bhagwanpur', capacity: '20', insuranceExpiry: '2026-07-29', fitnessExpiry: '2026-07-26', gpsEnabled: false, status: 'Reserved', remarks: 'Reserved for admissions day movement.', lastService: '2026-06-01', currentStudents: 13 },
  { id: 13, vehicleNumber: 'HU-13', vehicleName: 'Executive Bus', vehicleType: 'College Bus', registrationNumber: 'UK07YZ1123', driver: 'Harish Kapoor', mobile: '9876543222', route: 'Roorkee', capacity: '50', insuranceExpiry: '2026-09-19', fitnessExpiry: '2026-08-24', gpsEnabled: true, status: 'Active', remarks: 'Supports guest and staff transport.', lastService: '2026-06-13', currentStudents: 27 },
  { id: 14, vehicleNumber: 'HU-14', vehicleName: 'Faculty Van', vehicleType: 'Van', registrationNumber: 'UK08AB4455', driver: 'Rahul Dhyani', mobile: '9876543223', route: 'Haridwar', capacity: '20', insuranceExpiry: '2026-10-10', fitnessExpiry: '2026-09-08', gpsEnabled: true, status: 'Active', remarks: 'Used for faculty commute and meetings.', lastService: '2026-06-06', currentStudents: 11 },
  { id: 15, vehicleNumber: 'HU-15', vehicleName: 'Night Bus', vehicleType: 'Mini Bus', registrationNumber: 'UK08CD6677', driver: 'Suresh Chauhan', mobile: '9876543224', route: 'Bahadrabad', capacity: '40', insuranceExpiry: '2026-11-14', fitnessExpiry: '2026-10-17', gpsEnabled: true, status: 'Active', remarks: 'Night shift pickup route.', lastService: '2026-06-04', currentStudents: 31 },
  { id: 16, vehicleNumber: 'HU-16', vehicleName: 'Metro Van', vehicleType: 'Van', registrationNumber: 'UK08EF8899', driver: 'Anil Tiwari', mobile: '9876543225', route: 'Laksar', capacity: '20', insuranceExpiry: '2026-08-05', fitnessExpiry: '2026-07-12', gpsEnabled: false, status: 'Maintenance', remarks: 'Battery and brake inspection pending.', lastService: '2026-05-25', currentStudents: 8 },
  { id: 17, vehicleNumber: 'HU-17', vehicleName: 'Campus Coach', vehicleType: 'College Bus', registrationNumber: 'UK08GH0011', driver: 'Rajeev Nainwal', mobile: '9876543226', route: 'Manglaur', capacity: '50', insuranceExpiry: '2026-12-18', fitnessExpiry: '2026-11-15', gpsEnabled: true, status: 'Active', remarks: 'Large capacity route for day scholars.', lastService: '2026-06-03', currentStudents: 43 },
  { id: 18, vehicleNumber: 'HU-18', vehicleName: 'Town Shuttle', vehicleType: 'Mini Bus', registrationNumber: 'UK08IJ2233', driver: 'Manish Negi', mobile: '9876543227', route: 'Bhagwanpur', capacity: '40', insuranceExpiry: '2026-09-27', fitnessExpiry: '2026-08-31', gpsEnabled: true, status: 'Inactive', remarks: 'Temporarily paused for route review.', lastService: '2026-05-18', currentStudents: 0 },
  { id: 19, vehicleNumber: 'HU-19', vehicleName: 'Utility Van', vehicleType: 'Van', registrationNumber: 'UK08KL4455', driver: 'Pradeep Bist', mobile: '9876543228', route: 'Roorkee', capacity: '20', insuranceExpiry: '2026-10-27', fitnessExpiry: '2026-09-30', gpsEnabled: true, status: 'Reserved', remarks: 'Reserved for inter-college events.', lastService: '2026-06-08', currentStudents: 12 },
  { id: 20, vehicleNumber: 'HU-20', vehicleName: 'College Bus D', vehicleType: 'College Bus', registrationNumber: 'UK08MN6677', driver: 'Sunil Rawat', mobile: '9876543229', route: 'Haridwar', capacity: '50', insuranceExpiry: '2026-11-28', fitnessExpiry: '2026-10-21', gpsEnabled: true, status: 'Active', remarks: 'Highly utilized route with full occupancy.', lastService: '2026-06-15', currentStudents: 49 },
];

const emptyForm = {
  vehicleNumber: '',
  vehicleName: '',
  vehicleType: 'Mini Bus',
  registrationNumber: '',
  driver: '',
  mobile: '',
  route: '',
  capacity: '',
  insuranceExpiry: '',
  fitnessExpiry: '',
  gpsEnabled: true,
  status: 'Active',
  remarks: '',
};

function getStatusClasses(status) {
  switch (status) {
    case 'Active':
      return 'bg-emerald-100 text-emerald-700';
    case 'Maintenance':
      return 'bg-amber-100 text-amber-700';
    case 'Reserved':
      return 'bg-sky-100 text-sky-700';
    case 'Inactive':
      return 'bg-slate-100 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function InstituteTransportPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [search, setSearch] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');
  const [driverFilter, setDriverFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedHelp, setSelectedHelp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  const filteredVehicles = useMemo(() => {
    const term = search.toLowerCase();
    return vehicles.filter((vehicle) => {
      const matchesText = [vehicle.vehicleNumber, vehicle.vehicleName, vehicle.driver, vehicle.route, vehicle.vehicleType, vehicle.status]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(term));
      const matchesRoute = routeFilter === 'All' || vehicle.route === routeFilter;
      const matchesDriver = driverFilter === 'All' || vehicle.driver === driverFilter;
      const matchesType = typeFilter === 'All' || vehicle.vehicleType === typeFilter;
      const matchesStatus = statusFilter === 'All' || vehicle.status === statusFilter;
      return matchesText && matchesRoute && matchesDriver && matchesType && matchesStatus;
    });
  }, [vehicles, search, routeFilter, driverFilter, typeFilter, statusFilter]);

  const routeOptions = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.route)))];
  const driverOptions = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.driver)))];
  const typeOptions = ['All', ...Array.from(new Set(vehicles.map((vehicle) => vehicle.vehicleType)))];
  const statusOptions = ['All', 'Active', 'Maintenance', 'Inactive', 'Reserved'];

  const analytics = [
    { label: 'Total Vehicles', value: vehicles.length, icon: Bus },
    { label: 'Active Vehicles', value: vehicles.filter((item) => item.status === 'Active').length, icon: ShieldCheck },
    { label: 'Drivers', value: Array.from(new Set(vehicles.map((item) => item.driver))).length, icon: UserCog },
    { label: 'Students Using Transport', value: vehicles.reduce((sum, item) => sum + Number(item.currentStudents || 0), 0), icon: Users },
    { label: 'Routes', value: Array.from(new Set(vehicles.map((item) => item.route))).length, icon: MapPinned },
    { label: 'Today\'s Trips', value: 24, icon: Clock3 },
    { label: 'Monthly Revenue (Demo)', value: '₹4.8L', icon: Sparkles },
    { label: 'Pending Maintenance', value: vehicles.filter((item) => item.status === 'Maintenance').length, icon: Wrench },
  ];

  const quickActions = [
    { title: 'Assign Route', description: 'Map vehicles to routes and stopping points.', type: 'route' },
    { title: 'Allocate Students', description: 'Balance occupancy for every vehicle trip.', type: 'vehicle' },
    { title: 'Manage Drivers', description: 'Review driver availability and shifts.', type: 'driver' },
    { title: 'Service Schedule', description: 'Plan maintenance and inspection windows.', type: 'vehicle' },
    { title: 'Fuel Log', description: 'Track fuel consumption and trip efficiency.', type: 'vehicle' },
    { title: 'Transport Reports', description: 'Open analytics for transport operations.', type: 'report' },
  ];

  const resetForm = () => {
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!form.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle number is required';
    if (!form.vehicleName.trim()) errors.vehicleName = 'Vehicle name is required';
    if (!form.vehicleType.trim()) errors.vehicleType = 'Vehicle type is required';
    if (!form.registrationNumber.trim()) errors.registrationNumber = 'Registration number is required';
    if (!form.driver.trim()) errors.driver = 'Driver is required';
    if (!form.mobile.trim()) errors.mobile = 'Mobile number is required';
    if (!form.route.trim()) errors.route = 'Route is required';
    if (!form.capacity.trim()) errors.capacity = 'Capacity is required';
    if (!form.insuranceExpiry.trim()) errors.insuranceExpiry = 'Insurance expiry is required';
    if (!form.fitnessExpiry.trim()) errors.fitnessExpiry = 'Fitness expiry is required';
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

    const nextVehicle = {
      id: Date.now(),
      vehicleNumber: form.vehicleNumber.trim(),
      vehicleName: form.vehicleName.trim(),
      vehicleType: form.vehicleType.trim(),
      registrationNumber: form.registrationNumber.trim(),
      driver: form.driver.trim(),
      mobile: form.mobile.trim(),
      route: form.route.trim(),
      capacity: form.capacity.trim(),
      insuranceExpiry: form.insuranceExpiry.trim(),
      fitnessExpiry: form.fitnessExpiry.trim(),
      gpsEnabled: form.gpsEnabled,
      status: form.status,
      remarks: form.remarks.trim(),
      lastService: '2026-06-20',
      currentStudents: 0,
    };

    setVehicles((current) => [nextVehicle, ...current]);
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

    setVehicles((current) => current.map((item) => (item.id === selectedVehicle.id ? { ...item, ...form, vehicleNumber: form.vehicleNumber.trim(), vehicleName: form.vehicleName.trim(), vehicleType: form.vehicleType.trim(), registrationNumber: form.registrationNumber.trim(), driver: form.driver.trim(), mobile: form.mobile.trim(), route: form.route.trim(), capacity: form.capacity.trim(), insuranceExpiry: form.insuranceExpiry.trim(), fitnessExpiry: form.fitnessExpiry.trim(), gpsEnabled: form.gpsEnabled, status: form.status, remarks: form.remarks.trim() } : item)));
    setIsEditOpen(false);
    setSelectedVehicle(null);
    resetForm();
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setForm({
      vehicleNumber: vehicle.vehicleNumber,
      vehicleName: vehicle.vehicleName,
      vehicleType: vehicle.vehicleType,
      registrationNumber: vehicle.registrationNumber,
      driver: vehicle.driver,
      mobile: vehicle.mobile,
      route: vehicle.route,
      capacity: vehicle.capacity,
      insuranceExpiry: vehicle.insuranceExpiry,
      fitnessExpiry: vehicle.fitnessExpiry,
      gpsEnabled: vehicle.gpsEnabled,
      status: vehicle.status,
      remarks: vehicle.remarks,
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const confirmDelete = (vehicle) => {
    setDeleteTarget(vehicle);
    setIsDeleteOpen(true);
  };

  const removeVehicle = () => {
    if (!deleteTarget) return;
    setVehicles((current) => current.filter((item) => item.id !== deleteTarget.id));
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleImport = () => {
    const importedVehicle = {
      id: Date.now(),
      vehicleNumber: `HU-${String(vehicles.length + 1).padStart(2, '0')}`,
      vehicleName: 'Imported Shuttle',
      vehicleType: 'Mini Bus',
      registrationNumber: `UK09ZZ${String(vehicles.length + 1).padStart(4, '0')}`,
      driver: 'Imported Driver',
      mobile: '9876543300',
      route: 'Roorkee',
      capacity: '40',
      insuranceExpiry: '2027-01-10',
      fitnessExpiry: '2026-12-15',
      gpsEnabled: true,
      status: 'Active',
      remarks: 'Imported from CSV in the current session.',
      lastService: '2026-06-18',
      currentStudents: 23,
    };
    setVehicles((current) => [importedVehicle, ...current]);
  };

  const handleExport = () => {
    const csvRows = [
      ['Vehicle No.', 'Vehicle Name', 'Vehicle Type', 'Route', 'Driver', 'Capacity', 'Current Students', 'Status', 'Last Service'],
      ...filteredVehicles.map((item) => [item.vehicleNumber, item.vehicleName, item.vehicleType, item.route, item.driver, item.capacity, item.currentStudents, item.status, item.lastService]),
    ];
    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'transport-fleet.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const refreshFilters = () => {
    setSearch('');
    setRouteFilter('All');
    setDriverFilter('All');
    setTypeFilter('All');
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
                  { label: 'Transport' },
                ]}
              />
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.28em] text-emerald-600">Institute setup</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Transport Management</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage transport routes, vehicles, drivers, boarding points, student transport allocation and transport settings from one centralized workspace.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-slate-900">
          <BookOpen className="h-5 w-5 text-emerald-600" />
          <h3 className="text-lg font-semibold">Transport helpers</h3>
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-4">
          {helperCards.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  setSelectedHelp(item);
                  setIsHelpOpen(true);
                }}
                className="flex h-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-left transition hover-gradient-border"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="ml-3 h-4 w-4 text-slate-400" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Transport overview</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Available Transport Fleet</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsAddOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border"
          >
            <Plus className="h-4 w-4" /> Add Vehicle
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm hover-gradient-border">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search vehicle number"
              className="w-full bg-transparent outline-none sm:w-56"
            />
          </label>
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
            <select value={routeFilter} onChange={(event) => setRouteFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {routeOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Routes' : option}</option>)}
            </select>
            <select value={driverFilter} onChange={(event) => setDriverFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {driverOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Drivers' : option}</option>)}
            </select>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm outline-none hover-gradient-border">
              {typeOptions.map((option) => <option key={option} value={option}>{option === 'All' ? 'All Types' : option}</option>)}
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
                <th className="px-4 py-4">Vehicle No.</th>
                <th className="px-4 py-4">Vehicle Name</th>
                <th className="px-4 py-4">Vehicle Type</th>
                <th className="px-4 py-4">Route</th>
                <th className="px-4 py-4">Driver</th>
                <th className="px-4 py-4">Capacity</th>
                <th className="px-4 py-4">Current Students</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Last Service</th>
                <th className="px-4 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm">
              {filteredVehicles.map((vehicle, index) => (
                <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{index + 1}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-900">{vehicle.vehicleNumber}</td>
                  <td className="px-4 py-4 text-slate-700">{vehicle.vehicleName}</td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.vehicleType}</td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.route}</td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.driver}</td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.capacity}</td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.currentStudents}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusClasses(vehicle.status)}`}>{vehicle.status}</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4">{vehicle.lastService}</td>
                  <td className="whitespace-nowrap px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <button type="button" title="View" aria-label="View" onClick={() => { setSelectedVehicle(vehicle); setIsViewOpen(true); }} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 transition hover:bg-sky-100 hover-gradient-border">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button type="button" title="Edit" aria-label="Edit" onClick={() => openEditModal(vehicle)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 hover-gradient-border">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" title="Delete" aria-label="Delete" onClick={() => confirmDelete(vehicle)} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100 hover-gradient-border">
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {analytics.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.label} type="button" onClick={() => {
              if (item.label === 'Drivers') {
                setDetailModal({ title: 'Driver Details', body: 'Driver roster, route assignment and availability can be reviewed from the transport operations module.' });
              } else if (item.label === 'Routes') {
                setDetailModal({ title: 'Route Details', body: 'Route coverage, estimated time, and boarding points are updated centrally from the planning workspace.' });
              } else {
                setDetailModal({ title: item.label, body: 'The analytics card is interactive and mirrors the overall transport workspace.' });
              }
            }} className="rounded-[24px] border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover-gradient-border">
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
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => (
          <button key={action.title} type="button" onClick={() => {
            if (action.type === 'route') {
              setDetailModal({ title: 'Route Details', body: 'Assign and review transport routes, travel time, and stop clusters for each service corridor.' });
            } else if (action.type === 'driver') {
              setDetailModal({ title: 'Driver Details', body: 'Review driver shift availability, contact details and route assignments from a single panel.' });
            } else {
              setDetailModal({ title: action.title, body: 'The quick action is wired to the transport operations workspace and opens a live detail view.' });
            }
          }} className="rounded-[24px] border border-slate-200/80 bg-white p-5 text-left shadow-sm transition hover-gradient-border">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Quick action</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">{action.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{action.description}</p>
          </button>
        ))}
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Transport setup</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Add vehicle</h3>
              </div>
              <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleAddSubmit}>
              {[
                ['vehicleNumber', 'Vehicle Number'],
                ['vehicleName', 'Vehicle Name'],
                ['registrationNumber', 'Registration Number'],
                ['driver', 'Driver'],
                ['mobile', 'Mobile'],
                ['route', 'Route'],
                ['capacity', 'Capacity'],
                ['insuranceExpiry', 'Insurance Expiry'],
                ['fitnessExpiry', 'Fitness Expiry'],
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
                Vehicle Type
                <select value={form.vehicleType} onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Mini Bus">Mini Bus</option>
                  <option value="College Bus">College Bus</option>
                  <option value="Van">Van</option>
                  <option value="Electric Bus">Electric Bus</option>
                </select>
                {formErrors.vehicleType ? <p className="mt-1 text-xs text-rose-500">{formErrors.vehicleType}</p> : null}
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Reserved">Reserved</option>
                </select>
                {formErrors.status ? <p className="mt-1 text-xs text-rose-500">{formErrors.status}</p> : null}
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <input type="checkbox" checked={form.gpsEnabled} onChange={(event) => setForm((current) => ({ ...current, gpsEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                GPS Enabled
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

      {isEditOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Transport setup</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Edit vehicle</h3>
              </div>
              <button type="button" onClick={() => { setIsEditOpen(false); setSelectedVehicle(null); resetForm(); }} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              {[
                ['vehicleNumber', 'Vehicle Number'],
                ['vehicleName', 'Vehicle Name'],
                ['registrationNumber', 'Registration Number'],
                ['driver', 'Driver'],
                ['mobile', 'Mobile'],
                ['route', 'Route'],
                ['capacity', 'Capacity'],
                ['insuranceExpiry', 'Insurance Expiry'],
                ['fitnessExpiry', 'Fitness Expiry'],
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
                Vehicle Type
                <select value={form.vehicleType} onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Mini Bus">Mini Bus</option>
                  <option value="College Bus">College Bus</option>
                  <option value="Van">Van</option>
                  <option value="Electric Bus">Electric Bus</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border">
                  <option value="Active">Active</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                <input type="checkbox" checked={form.gpsEnabled} onChange={(event) => setForm((current) => ({ ...current, gpsEnabled: event.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-emerald-600" />
                GPS Enabled
              </label>

              <label className="text-sm font-medium text-slate-700 md:col-span-2">
                Remarks
                <textarea value={form.remarks} onChange={(event) => setForm((current) => ({ ...current, remarks: event.target.value }))} rows="3" className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none hover-gradient-border" />
              </label>

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                  Save changes
                </button>
                <button type="button" onClick={() => { setIsEditOpen(false); setSelectedVehicle(null); resetForm(); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewOpen && selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Vehicle details</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedVehicle.vehicleName}</h3>
              </div>
              <button type="button" onClick={() => setIsViewOpen(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                ['Vehicle Number', selectedVehicle.vehicleNumber],
                ['Registration Number', selectedVehicle.registrationNumber],
                ['Vehicle Type', selectedVehicle.vehicleType],
                ['Route', selectedVehicle.route],
                ['Driver', selectedVehicle.driver],
                ['Mobile', selectedVehicle.mobile],
                ['Capacity', selectedVehicle.capacity],
                ['Status', selectedVehicle.status],
                ['Insurance Expiry', selectedVehicle.insuranceExpiry],
                ['Fitness Expiry', selectedVehicle.fitnessExpiry],
                ['GPS Enabled', selectedVehicle.gpsEnabled ? 'Yes' : 'No'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
                </div>
              ))}
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Remarks</p>
                <p className="mt-2 text-sm text-slate-700">{selectedVehicle.remarks}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {isHelpOpen && selectedHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Help modal</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedHelp.detailTitle}</h3>
              </div>
              <button type="button" onClick={() => setIsHelpOpen(false)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
              {selectedHelp.detailText}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setIsHelpOpen(false)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Delete vehicle</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">Remove {deleteTarget.vehicleName}?</h3>
            <p className="mt-3 text-sm text-slate-600">This action will remove the vehicle from the current transport fleet view.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={removeVehicle} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 hover-gradient-border">Delete</button>
              <button type="button" onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover-gradient-border">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {detailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">Transport detail</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{detailModal.title}</h3>
              </div>
              <button type="button" onClick={() => setDetailModal(null)} className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-600 transition hover:bg-slate-100 hover-gradient-border">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-700">
              {detailModal.body}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setDetailModal(null)} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 hover-gradient-border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
