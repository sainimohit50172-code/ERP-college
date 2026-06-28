import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  useBulkExport,
  useBulkImport,
  useCreateResource,
  useResourceList,
  useUpdateResource,
  useDeleteResource,
} from '../hooks/useResourceHooks';
import {
  FaBus,
  FaCar,
  FaDownload,
  FaEdit,
  FaFileImport,
  FaPlus,
  FaPrint,
  FaRoute,
  FaTrash,
  FaUserTie,
} from 'react-icons/fa';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
import { usePermissions } from '../services/permissionHelpers.js';
import WithPermission from '../components/auth/WithPermission.jsx';

const transportStatusOptions = [
  { value: 'All', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'UnderMaintenance', label: 'Under Maintenance' },
  { value: 'Due', label: 'Due' },
];

const vehicleTypes = [
  { value: 'Bus', label: 'Bus' },
  { value: 'Van', label: 'Van' },
  { value: 'Mini Bus', label: 'Mini Bus' },
  { value: 'Car', label: 'Car' },
  { value: 'Truck', label: 'Truck' },
];

const defaultVehicle = {
  vehicleNumber: '',
  vehicleType: 'Bus',
  busName: '',
  capacity: '20',
  gpsId: '',
  engineNumber: '',
  chassisNumber: '',
  purchaseDate: '',
  insuranceExpiry: '',
  permitExpiry: '',
  pollutionCertificateExpiry: '',
  rcUpload: '',
  insuranceUpload: '',
  status: 'Active',
};

const defaultDriver = {
  name: '',
  employeeId: '',
  licenseNumber: '',
  licenseExpiry: '',
  mobile: '',
  address: '',
  emergencyContact: '',
  bloodGroup: '',
  joiningDate: '',
  salary: '',
  status: 'Active',
};

const defaultRoute = {
  routeName: '',
  routeCode: '',
  source: '',
  destination: '',
  stops: '',
  distance: '',
  estimatedTime: '',
  fare: '',
};

const defaultStop = {
  stopName: '',
  landmark: '',
  latitude: '',
  longitude: '',
  arrivalTime: '',
};

const defaultStudentAssign = {
  studentId: '',
  routeId: '',
  vehicleId: '',
  seatNumber: '',
  pickupStopId: '',
  dropStopId: '',
};

const defaultEmployeeAssign = {
  employeeId: '',
  vehicleId: '',
  pickupPointId: '',
  dropPointId: '',
};

const defaultVehicleAttendance = {
  vehicleId: '',
  date: '',
  outTime: '',
  inTime: '',
  driverId: '',
  conductorId: '',
  kmStart: '',
  kmEnd: '',
  fuelUsed: '',
};

const defaultFuelEntry = {
  vehicleId: '',
  date: '',
  fuelCost: '',
  mileage: '',
  quantity: '',
  station: '',
};

const defaultMaintenance = {
  vehicleId: '',
  serviceType: 'Engine Service',
  serviceDate: '',
  dueDate: '',
  expense: '',
  notes: '',
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

export default function TransportManagementPage() {
  const importInputRef = useRef(null);

  const { data: vehiclesData } = useResourceList('transportVehicles', { page: 1, pageSize: 200 });
  const { data: driversData } = useResourceList('transportDrivers', { page: 1, pageSize: 200 });
  const { data: conductorsData } = useResourceList('transportConductors', { page: 1, pageSize: 200 });
  const { data: routesData } = useResourceList('transportRoutes', { page: 1, pageSize: 200 });
  const { data: stopsData } = useResourceList('transportStops', { page: 1, pageSize: 200 });
  const { data: studentsData } = useResourceList('students', { page: 1, pageSize: 200 });
  const { data: employeesData } = useResourceList('employees', { page: 1, pageSize: 200 });
  const { data: studentAssignmentsData } = useResourceList('studentTransportAssignments', { page: 1, pageSize: 200 });
  const { data: employeeAssignmentsData } = useResourceList('employeeTransportAssignments', { page: 1, pageSize: 200 });
  const { data: attendanceData } = useResourceList('vehicleAttendance', { page: 1, pageSize: 200 });
  const { data: fuelEntriesData } = useResourceList('fuelEntries', { page: 1, pageSize: 200 });
  const { data: maintenanceData } = useResourceList('maintenanceRecords', { page: 1, pageSize: 200 });

  const vehicles = vehiclesData?.items || [];
  const drivers = driversData?.items || [];
  const conductors = conductorsData?.items || [];
  const routes = routesData?.items || [];
  const stops = stopsData?.items || [];
  const students = studentsData?.items || [];
  const employees = employeesData?.items || [];
  const studentAssignments = studentAssignmentsData?.items || [];
  const employeeAssignments = employeeAssignmentsData?.items || [];
  const attendanceRecords = attendanceData?.items || [];
  const fuelEntries = fuelEntriesData?.items || [];
  const maintenanceRecords = maintenanceData?.items || [];

  const createVehicle = useCreateResource('transportVehicles');
  const updateVehicle = useUpdateResource('transportVehicles');
  const deleteVehicle = useDeleteResource('transportVehicles');
  const importVehicles = useBulkImport('transportVehicles');
  const exportVehicles = useBulkExport('transportVehicles');

  const createDriver = useCreateResource('transportDrivers');
  const updateDriver = useUpdateResource('transportDrivers');
  const deleteDriver = useDeleteResource('transportDrivers');
  const importDrivers = useBulkImport('transportDrivers');
  const exportDrivers = useBulkExport('transportDrivers');

  const createRoute = useCreateResource('transportRoutes');
  const updateRoute = useUpdateResource('transportRoutes');
  const deleteRoute = useDeleteResource('transportRoutes');
  const importRoutes = useBulkImport('transportRoutes');
  const exportRoutes = useBulkExport('transportRoutes');

  const createStop = useCreateResource('transportStops');
  const updateStop = useUpdateResource('transportStops');
  const deleteStop = useDeleteResource('transportStops');
  const importStops = useBulkImport('transportStops');
  const exportStops = useBulkExport('transportStops');

  const createStudentAssignment = useCreateResource('studentTransportAssignments');
  const importStudentAssignments = useBulkImport('studentTransportAssignments');
  const exportStudentAssignments = useBulkExport('studentTransportAssignments');

  const createEmployeeAssignment = useCreateResource('employeeTransportAssignments');
  const importEmployeeAssignments = useBulkImport('employeeTransportAssignments');
  const exportEmployeeAssignments = useBulkExport('employeeTransportAssignments');

  const createAttendance = useCreateResource('vehicleAttendance');
  const importAttendance = useBulkImport('vehicleAttendance');
  const exportAttendance = useBulkExport('vehicleAttendance');

  const createFuelEntry = useCreateResource('fuelEntries');
  const importFuelEntries = useBulkImport('fuelEntries');
  const exportFuelEntries = useBulkExport('fuelEntries');

  const createMaintenance = useCreateResource('maintenanceRecords');
  const importMaintenance = useBulkImport('maintenanceRecords');
  const exportMaintenance = useBulkExport('maintenanceRecords');

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState('vehicles');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const pageSize = 6;
  const perms = usePermissions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: defaultVehicle });

  const handleImport = (resourceImport, file, successLabel) => {
    if (!file) return;
    setImportStatus(`Importing ${successLabel}…`);
    const formData = new FormData();
    formData.append('file', file);
    resourceImport.mutate(formData, {
      onSuccess: () => setImportStatus(`${successLabel} imported successfully.`),
      onError: () => setImportStatus(`Import failed. Please check the CSV format and try again.`),
    });
  };

  const handleFileChange = (event, resourceImport, successLabel) => {
    const file = event.target.files?.[0];
    handleImport(resourceImport, file, successLabel);
    event.target.value = '';
  };

  const handleExport = async (resourceExport, filename) => {
    setIsExporting(true);
    try {
      const blob = await resourceExport.mutateAsync();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const vehicleCount = vehicles.length;
  const activeVehicleCount = vehicles.filter((vehicle) => vehicle.status === 'Active').length;
  const driverCount = drivers.length;
  const conductorCount = conductors.length;
  const studentsAssigned = studentAssignments.length;
  const employeesAssigned = employeeAssignments.length;
  const routeCount = routes.length;
  const stopCount = stops.length;
  const monthlyFuelCost = fuelEntries.reduce((sum, entry) => sum + (Number(entry.fuelCost) || 0), 0);
  const maintenanceDue = maintenanceRecords.filter((record) => record.dueDate && new Date(record.dueDate) <= new Date()).length;
  const insuranceExpiry = vehicles.filter((vehicle) => vehicle.insuranceExpiry && new Date(vehicle.insuranceExpiry) <= new Date()).length;
  const todayTrips = attendanceRecords.filter((record) => record.date === new Date().toISOString().slice(0, 10)).length;

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchTerm = search.toLowerCase();
      const matchesSearch = [vehicle.vehicleNumber, vehicle.busName, vehicle.vehicleType, vehicle.gpsId, vehicle.status]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = filter === 'All' || vehicle.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [vehicles, search, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const displayedVehicles = filteredVehicles.slice((page - 1) * pageSize, page * pageSize);

  const vehicleRows = displayedVehicles.map((vehicle) => [
    vehicle.vehicleNumber,
    vehicle.vehicleType,
    vehicle.busName,
    vehicle.capacity,
    vehicle.gpsId,
    vehicle.status,
    <div className="flex items-center gap-2">
      <WithPermission moduleKey="transport" action="edit">
        <button onClick={() => { setSelectedRecord(vehicle); setIsEditMode(true); setIsModalOpen(true); reset({ ...vehicle }); }} className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"><FaEdit /></button>
      </WithPermission>
      <WithPermission moduleKey="transport" action="delete">
        <button onClick={() => deleteVehicle.mutate(vehicle.id)} className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20"><FaTrash /></button>
      </WithPermission>
    </div>,
  ]);

  return (
    <div className="space-y-8">
      <SectionHeader title="Transport management" subtitle="Manage transport operations including vehicles, drivers, routes, fuel, maintenance, and assignments." />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">
            {[
              { label: 'Total Vehicles', value: vehicleCount },
              { label: 'Active Vehicles', value: activeVehicleCount },
              { label: 'Drivers', value: driverCount },
              { label: 'Conductors', value: conductorCount },
              { label: 'Students Assigned', value: studentsAssigned },
              { label: 'Employees Assigned', value: employeesAssigned },
              { label: 'Routes', value: routeCount },
              { label: 'Stops', value: stopCount },
            ].map((card) => (
              <div key={card.label} className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
                <p className="mt-4 text-3xl font-semibold text-white">{card.value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Fuel cost (monthly)</p>
              <p className="mt-4 text-3xl font-semibold text-white">${monthlyFuelCost.toFixed(2)}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Maintenance due</p>
              <p className="mt-4 text-3xl font-semibold text-white">{maintenanceDue}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Insurance expiry</p>
              <p className="mt-4 text-3xl font-semibold text-white">{insuranceExpiry}</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Today's trips</p>
              <p className="mt-4 text-3xl font-semibold text-white">{todayTrips}</p>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Vehicle management</h2>
                <p className="text-sm text-slate-400">Create and manage transport vehicles, documents, and status tracking.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => handleExport(exportVehicles, 'transport-vehicles-export.xlsx')} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  <FaDownload /> Export
                </button>
                <button onClick={() => importInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaFileImport /> Import
                </button>
                <button onClick={() => { setIsEditMode(false); setSelectedRecord(null); reset(defaultVehicle); setIsModalOpen(true); }} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  <FaPlus /> Add vehicle
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={search} onSearch={setSearch} filter={filter} onFilter={setFilter} options={transportStatusOptions} />
            </div>
            <div className="mt-6">
              <DataTable
                columns={['Vehicle #', 'Type', 'Name', 'Capacity', 'GPS ID', 'Status', 'Actions']}
                rows={vehicleRows}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-6 shadow-soft">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-400/10 text-sky-300">
              <FaBus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Transport snapshot</p>
              <h3 className="text-xl font-semibold text-white">Operations dashboard</h3>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Route coverage</p>
              <p className="mt-3 text-3xl font-semibold text-white">{routeCount} routes</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Stop locations</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stopCount} stops</p>
            </div>
            <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5">
              <p className="text-sm text-slate-400">Fuel records</p>
              <p className="mt-3 text-3xl font-semibold text-white">{fuelEntries.length}</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title={isEditMode ? 'Edit vehicle' : 'Add vehicle'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        footer={
          <button onClick={handleSubmit((data) => {
            const payload = {
              ...data,
              capacity: Number(data.capacity) || 0,
            };
            if (isEditMode && selectedRecord) {
              updateVehicle.mutate({ id: selectedRecord.id, payload });
            } else {
              createVehicle.mutate(payload);
            }
            setIsModalOpen(false);
            setSelectedRecord(null);
            setIsEditMode(false);
            reset(defaultVehicle);
          })} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            Save vehicle
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Vehicle number">
            <input type="text" {...register('vehicleNumber', { required: 'Vehicle number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="TN-01-AB-1234" />
            {errors.vehicleNumber && <p className="mt-1 text-sm text-rose-400">{errors.vehicleNumber.message}</p>}
          </FormField>
          <FormField label="Vehicle type">
            <select {...register('vehicleType')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Bus name">
            <input type="text" {...register('busName')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Campus Cruiser" />
          </FormField>
          <FormField label="Capacity">
            <input type="number" {...register('capacity', { valueAsNumber: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="40" />
          </FormField>
          <FormField label="GPS ID">
            <input type="text" {...register('gpsId')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="GPS-6789" />
          </FormField>
          <FormField label="Engine number">
            <input type="text" {...register('engineNumber')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="ENG1234567" />
          </FormField>
          <FormField label="Chassis number">
            <input type="text" {...register('chassisNumber')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="CHS9876543" />
          </FormField>
          <FormField label="Purchase date">
            <input type="date" {...register('purchaseDate')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Insurance expiry">
            <input type="date" {...register('insuranceExpiry')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Permit expiry">
            <input type="date" {...register('permitExpiry')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Pollution certificate expiry">
            <input type="date" {...register('pollutionCertificateExpiry')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="RC upload URL">
            <input type="text" {...register('rcUpload')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="https://..." />
          </FormField>
          <FormField label="Insurance upload URL">
            <input type="text" {...register('insuranceUpload')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="https://..." />
          </FormField>
          <FormField label="Status">
            <select {...register('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              {transportStatusOptions.filter((option) => option.value !== 'All').map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
        </form>
      </Modal>

      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleFileChange(event, importVehicles, 'vehicles')} />
    </div>
  );
}
