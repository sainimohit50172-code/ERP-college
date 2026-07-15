import { useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useBulkExport,
  useBulkImport,
  useCreateResource,
  useResourceList,
  useUpdateResource,
  useDeleteResource,
} from '../hooks/useResourceHooks';
import {
  FaDownload,
  FaEdit,
  FaFileImport,
  FaPlus,
  FaTrash,
  FaLink,
} from 'react-icons/fa';
import { assignVehicle, unassignVehicle } from '../services/driverService.js';
import SectionHeader from '../components/ui/SectionHeader.jsx';
import SearchFilter from '../components/forms/SearchFilter.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import TablePagination from '../components/tables/TablePagination.jsx';
import Modal from '../components/ui/Modal.jsx';
import FormField from '../components/forms/FormField.jsx';
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
const _defaultDriver = {
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
const _defaultRoute = {
  routeName: '',
  routeCode: '',
  source: '',
  destination: '',
  stops: '',
  distance: '',
  estimatedTime: '',
  fare: '',
};
const _defaultStop = {
  stopName: '',
  landmark: '',
  latitude: '',
  longitude: '',
  arrivalTime: '',
};
const _defaultStudentAssign = {
  studentId: '',
  routeId: '',
  vehicleId: '',
  seatNumber: '',
  pickupStopId: '',
  dropStopId: '',
};
const _defaultEmployeeAssign = {
  employeeId: '',
  vehicleId: '',
  pickupPointId: '',
  dropPointId: '',
};
const _defaultVehicleAttendance = {
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
const _defaultFuelEntry = {
  vehicleId: '',
  date: '',
  fuelCost: '',
  mileage: '',
  quantity: '',
  station: '',
};
const _defaultMaintenance = {
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
  const _students = studentsData?.items || [];
  const _employees = employeesData?.items || [];
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
  const _createDriver = useCreateResource('transportDrivers');
  const _updateDriver = useUpdateResource('transportDrivers');
  const _deleteDriver = useDeleteResource('transportDrivers');
  const _importDrivers = useBulkImport('transportDrivers');
  const _exportDrivers = useBulkExport('transportDrivers');
  const _createRoute = useCreateResource('transportRoutes');
  const _updateRoute = useUpdateResource('transportRoutes');
  const _deleteRoute = useDeleteResource('transportRoutes');
  const _importRoutes = useBulkImport('transportRoutes');
  const _exportRoutes = useBulkExport('transportRoutes');
  const _createStop = useCreateResource('transportStops');
  const _updateStop = useUpdateResource('transportStops');
  const _deleteStop = useDeleteResource('transportStops');
  const _importStops = useBulkImport('transportStops');
  const _exportStops = useBulkExport('transportStops');
  const _createStudentAssignment = useCreateResource('studentTransportAssignments');
  const _importStudentAssignments = useBulkImport('studentTransportAssignments');
  const _exportStudentAssignments = useBulkExport('studentTransportAssignments');
  const _createEmployeeAssignment = useCreateResource('employeeTransportAssignments');
  const _importEmployeeAssignments = useBulkImport('employeeTransportAssignments');
  const _exportEmployeeAssignments = useBulkExport('employeeTransportAssignments');
  const _createAttendance = useCreateResource('vehicleAttendance');
  const _importAttendance = useBulkImport('vehicleAttendance');
  const _exportAttendance = useBulkExport('vehicleAttendance');
  const _createFuelEntry = useCreateResource('fuelEntries');
  const _importFuelEntries = useBulkImport('fuelEntries');
  const _exportFuelEntries = useBulkExport('fuelEntries');
  const _createMaintenance = useCreateResource('maintenanceRecords');
  const _importMaintenance = useBulkImport('maintenanceRecords');
  const _exportMaintenance = useBulkExport('maintenanceRecords');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('All');
  const [driverSearch, setDriverSearch] = useState('');
  const [driverFilter, setDriverFilter] = useState('All');
  const [vehiclePage, setVehiclePage] = useState(1);
  const [driverPage, setDriverPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isDriverEditMode, setIsDriverEditMode] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentTarget, setAssignmentTarget] = useState(null);
  const [assignmentVehicleId, setAssignmentVehicleId] = useState('');
  const [_importStatus, setImportStatus] = useState('');
  const [_isExporting, setIsExporting] = useState(false);
  const [_isPrinting, _setIsPrinting] = useState(false);
  const pageSize = 6;
  const queryClient = useQueryClient();
  const assignDriverMutation = useMutation({
    mutationFn: ({ driverId, vehicleId }) => assignVehicle(driverId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['transportDrivers']);
      queryClient.invalidateQueries(['transportVehicles']);
    },
  });
  const unassignDriverMutation = useMutation({
    mutationFn: ({ driverId }) => unassignVehicle(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries(['transportDrivers']);
      queryClient.invalidateQueries(['transportVehicles']);
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, _isSubmitting },
  } = useForm({ defaultValues: defaultVehicle });
  const {
    register: registerDriver,
    handleSubmit: handleSubmitDriver,
    reset: resetDriver,
    formState: { errors: driverErrors },
  } = useForm({ defaultValues: _defaultDriver });
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
  const driverFilterOptions = [
    { value: 'All', label: 'All statuses' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'Assigned', label: 'Assigned' },
    { value: 'Archived', label: 'Archived' },
  ];
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const searchTerm = vehicleSearch.toLowerCase();
      const matchesSearch = [vehicle.vehicleNumber, vehicle.busName, vehicle.vehicleType, vehicle.gpsId, vehicle.status]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = vehicleFilter === 'All' || vehicle.status === vehicleFilter;
      return matchesSearch && matchesFilter;
    });
  }, [vehicles, vehicleSearch, vehicleFilter]);
  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const searchTerm = driverSearch.toLowerCase();
      const matchesSearch = [driver.name, driver.employeeId, driver.licenseNumber, driver.mobile, driver.status]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(searchTerm));
      const matchesFilter = driverFilter === 'All' || (driverFilter === 'Assigned' ? !!driver.assignedVehicle : driver.status === driverFilter);
      return matchesSearch && matchesFilter;
    });
  }, [drivers, driverSearch, driverFilter]);
  const vehiclePageCount = Math.max(1, Math.ceil(filteredVehicles.length / pageSize));
  const driverPageCount = Math.max(1, Math.ceil(filteredDrivers.length / pageSize));
  const displayedVehicles = filteredVehicles.slice((vehiclePage - 1) * pageSize, vehiclePage * pageSize);
  const displayedDrivers = filteredDrivers.slice((driverPage - 1) * pageSize, driverPage * pageSize);
  const vehicleRows = displayedVehicles.map((vehicle) => [
    vehicle.vehicleNumber,
    vehicle.vehicleType,
    vehicle.busName,
    vehicle.capacity,
    vehicle.gpsId,
    vehicle.status,
    <div key={`${vehicle.id}-actions`} className="flex items-center gap-2">
      <WithPermission moduleKey="transport" action="view">
        <ViewButton
          title="View vehicle"
          ariaLabel="View vehicle"
          className="h-8 w-8 rounded-full bg-slate-800/80 text-slate-200 hover:bg-slate-700"
          onClick={() => {}}
        />
      </WithPermission>
      <WithPermission moduleKey="transport" action="edit">
        <button aria-label="Edit" onClick={() => { setSelectedRecord(vehicle); setIsEditMode(true); setIsModalOpen(true); reset({ ...vehicle }); }} className="h-8 w-8 flex items-center justify-center rounded-full bg-slate-800/80 text-slate-200 hover:bg-slate-700"><FaEdit /></button>
      </WithPermission>
      <WithPermission moduleKey="transport" action="delete">
        <button aria-label="Delete" onClick={() => deleteVehicle.mutate(vehicle.id)} className="h-8 w-8 flex items-center justify-center rounded-full bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"><FaTrash /></button>
      </WithPermission>
    </div>,
  ]);
  const driverRows = displayedDrivers.map((driver) => {
    const assignedVehicle = vehicles.find((vehicle) => String(vehicle.id) === String(driver.assignedVehicle));
    return [
      driver.name,
      driver.employeeId,
      driver.licenseNumber,
      driver.mobile,
      driver.status,
      assignedVehicle ? `${assignedVehicle.vehicleNumber || assignedVehicle.registration || assignedVehicle.id}` : 'Unassigned',
      <div key={`${driver.id}-actions`} className="flex flex-wrap items-center gap-2">
        <WithPermission moduleKey="transport" action="edit">
          <button
            onClick={() => {
              setSelectedDriver(driver);
              setIsDriverEditMode(true);
              resetDriver({
                ...driver,
                salary: driver.salary ? String(driver.salary).replace(/[^0-9.]/g, '') : '',
              });
              setIsDriverModalOpen(true);
            }}
            className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
          >
            <FaEdit />
          </button>
        </WithPermission>
        <WithPermission moduleKey="transport" action="delete">
          <button onClick={() => _deleteDriver.mutate(driver.id)} className="rounded-full border border-white/10 bg-rose-500/10 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-500/20">
            <FaTrash />
          </button>
        </WithPermission>
        <button
          type="button"
          onClick={() => {
            setAssignmentTarget(driver);
            setAssignmentVehicleId(driver.assignedVehicle || (vehicles[0]?.id || ''));
            setIsAssignmentModalOpen(true);
          }}
          className="rounded-full border border-white/10 bg-slate-800 px-3 py-2 text-xs text-slate-200 transition hover:bg-slate-700"
        >
          <FaLink />
        </button>
        {driver.assignedVehicle && (
          <button
            type="button"
            onClick={() => unassignDriverMutation.mutate({ driverId: driver.id })}
            className="rounded-full border border-white/10 bg-sky-400/10 px-3 py-2 text-xs text-sky-300 transition hover:bg-sky-400/20"
          >
            Unassign
          </button>
        )}
      </div>,
    ];
  });
  return (
    <div className="space-y-8">
      <SectionHeader title="Transport management" subtitle="Manage transport operations including vehicles, drivers, routes, fuel, maintenance, and assignments." />
      <div className="grid gap-6">
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
              <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Today&apos;s trips</p>
              <p className="mt-4 text-3xl font-semibold text-white">{todayTrips}</p>
            </div>
          </div>
          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
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
              <SearchFilter search={vehicleSearch} onSearch={setVehicleSearch} filter={vehicleFilter} onFilter={setVehicleFilter} options={transportStatusOptions} />
            </div>
            <div className="mt-6">
              <DataTable
                columns={[
                  { label: 'Vehicle #', key: 'vehicleNumber', minWidth: '160px' },
                  { label: 'Type', key: 'type', minWidth: '100px' },
                  { label: 'Name', key: 'name', minWidth: '160px' },
                  { label: 'Capacity', key: 'capacity', minWidth: '90px' },
                  { label: 'GPS ID', key: 'gps', minWidth: '120px' },
                  { label: 'Status', key: 'status', minWidth: '90px' },
                  { label: 'Actions', key: 'actions', minWidth: '120px' },
                ]}
                rows={vehicleRows}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={vehiclePage} pageCount={vehiclePageCount} onPageChange={setVehiclePage} />
            </div>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-slate-900/80 p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Driver management</h2>
                <p className="text-sm text-slate-400">Create, assign, and monitor transport drivers and fleet assignments.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => handleExport(_exportDrivers, 'transport-drivers-export.xlsx')} className="inline-flex items-center gap-2 rounded-3xl bg-slate-800/80 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-700">
                  <FaDownload /> Export
                </button>
                <button onClick={() => importInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-3xl bg-sky-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
                  <FaFileImport /> Import
                </button>
                <button onClick={() => {
                  setIsDriverEditMode(false);
                  setSelectedDriver(null);
                  resetDriver(_defaultDriver);
                  setIsDriverModalOpen(true);
                }} className="inline-flex items-center gap-2 rounded-3xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                  <FaPlus /> Add driver
                </button>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <SearchFilter search={driverSearch} onSearch={setDriverSearch} filter={driverFilter} onFilter={setDriverFilter} options={driverFilterOptions} />
            </div>
            <div className="mt-6">
              <DataTable
                columns={[
                  { label: 'Name', key: 'name', minWidth: '180px' },
                  { label: 'Employee ID', key: 'employeeId', minWidth: '120px' },
                  { label: 'License #', key: 'license', minWidth: '140px' },
                  { label: 'Mobile', key: 'mobile', minWidth: '120px' },
                  { label: 'Status', key: 'status', minWidth: '90px' },
                  { label: 'Assigned Vehicle', key: 'assigned', minWidth: '140px' },
                  { label: 'Actions', key: 'actions', minWidth: '120px' },
                ]}
                rows={driverRows}
              />
            </div>
            <div className="mt-6">
              <TablePagination page={driverPage} pageCount={driverPageCount} onPageChange={setDriverPage} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Route coverage</p>
            <p className="mt-4 text-3xl font-semibold text-white">{routeCount} routes</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Stop locations</p>
            <p className="mt-4 text-3xl font-semibold text-white">{stopCount} stops</p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-900/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Fuel records</p>
            <p className="mt-4 text-3xl font-semibold text-white">{fuelEntries.length}</p>
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
      <Modal
        title={isDriverEditMode ? 'Edit driver' : 'Add driver'}
        isOpen={isDriverModalOpen}
        onClose={() => setIsDriverModalOpen(false)}
        footer={
          <button onClick={handleSubmitDriver((data) => {
            const payload = {
              ...data,
              salary: Number(data.salary) || 0,
            };
            if (isDriverEditMode && selectedDriver) {
              _updateDriver.mutate({ id: selectedDriver.id, payload });
            } else {
              _createDriver.mutate(payload);
            }
            setIsDriverModalOpen(false);
            setSelectedDriver(null);
            setIsDriverEditMode(false);
            resetDriver(_defaultDriver);
          })} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            Save driver
          </button>
        }
      >
        <form className="grid gap-5 lg:grid-cols-2">
          <FormField label="Name">
            <input type="text" {...registerDriver('name', { required: 'Name is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="Driver name" />
            {driverErrors.name && <p className="mt-1 text-sm text-rose-400">{driverErrors.name.message}</p>}
          </FormField>
          <FormField label="Employee ID">
            <input type="text" {...registerDriver('employeeId', { required: 'Employee ID is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="EMP-001" />
            {driverErrors.employeeId && <p className="mt-1 text-sm text-rose-400">{driverErrors.employeeId.message}</p>}
          </FormField>
          <FormField label="License number">
            <input type="text" {...registerDriver('licenseNumber', { required: 'License number is required' })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="LIC-12345" />
            {driverErrors.licenseNumber && <p className="mt-1 text-sm text-rose-400">{driverErrors.licenseNumber.message}</p>}
          </FormField>
          <FormField label="Mobile">
            <input type="text" {...registerDriver('mobile')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="(555) 123-4567" />
          </FormField>
          <FormField label="Status">
            <select {...registerDriver('status')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              {transportStatusOptions.filter((option) => option.value !== 'All').map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </FormField>
          <FormField label="License expiry">
            <input type="date" {...registerDriver('licenseExpiry')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Address">
            <input type="text" {...registerDriver('address')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="123 Main St" />
          </FormField>
          <FormField label="Emergency contact">
            <input type="text" {...registerDriver('emergencyContact')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="(555) 987-6543" />
          </FormField>
          <FormField label="Blood group">
            <input type="text" {...registerDriver('bloodGroup')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="O+" />
          </FormField>
          <FormField label="Joining date">
            <input type="date" {...registerDriver('joiningDate')} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" />
          </FormField>
          <FormField label="Salary">
            <input type="number" {...registerDriver('salary', { valueAsNumber: true })} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400" placeholder="25000" />
          </FormField>
        </form>
      </Modal>
      <Modal
        title={assignmentTarget ? `Assign vehicle to ${assignmentTarget.name}` : 'Assign vehicle'}
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        footer={
          <button onClick={() => {
            if (assignmentTarget) {
              assignDriverMutation.mutate({ driverId: assignmentTarget.id, vehicleId: assignmentVehicleId });
            }
            setIsAssignmentModalOpen(false);
          }} className="rounded-3xl bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-300">
            Save assignment
          </button>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-400">Driver</p>
            <p className="mt-1 text-lg font-semibold text-white">{assignmentTarget?.name || 'Select driver'}</p>
          </div>
          <FormField label="Vehicle">
            <select value={assignmentVehicleId} onChange={(event) => setAssignmentVehicleId(event.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 outline-none focus:border-sky-400">
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber || vehicle.busName || vehicle.id}</option>
              ))}
            </select>
          </FormField>
          <p className="text-sm text-slate-500">Select a vehicle to assign. Existing assignments will be updated automatically.</p>
        </div>
      </Modal>
      <input ref={importInputRef} type="file" accept=".csv" className="hidden" onChange={(event) => handleFileChange(event, importVehicles, 'vehicles')} />
    </div>
  );
}