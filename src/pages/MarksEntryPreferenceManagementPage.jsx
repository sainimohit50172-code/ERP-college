import { useEffect, useMemo, useState } from 'react';
import { Eye, Pencil, Save, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import DataTable from '../components/ui/DataTable.jsx';
import Modal from '../components/ui/Modal.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import { useCreateResource, useDeleteResource, useResourceList, useUpdateResource } from '../hooks/useResourceHooks.js';

const settingDefaults = { studentAwakeStatus: false, autoApprove: false, personalDetailsCheck: false };
const preferenceDefaults = { academicSessionId: '', instituteId: '', courseId: '', programId: '', semesterId: '', examTypeId: '', status: 'Active' };

function PreferenceFields({ register, errors }) {
  const fields = [['academicSessionId', 'Academic Session'], ['instituteId', 'Institute'], ['courseId', 'Course'], ['programId', 'Program'], ['semesterId', 'Semester'], ['examTypeId', 'Exam Type']];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(([name, label]) => (
        <label key={name}>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</span>
          <input
            type="number"
            min="1"
            {...register(name, { required: `${label} is required`, valueAsNumber: true, min: { value: 1, message: `${label} must be selected` } })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          {errors[name] && <span className="mt-1 block text-xs text-rose-600">{errors[name].message}</span>}
        </label>
      ))}
      <label>
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span>
        <select
          {...register('status', { required: 'Status is required' })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option>Active</option>
          <option>Inactive</option>
          <option>Draft</option>
        </select>
        {errors.status && <span className="mt-1 block text-xs text-rose-600">{errors.status.message}</span>}
      </label>
    </div>
  );
}

export default function MarksEntryPreferenceManagementPage() {
  const [settings, setSettings] = useState(settingDefaults);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [preferenceMode, setPreferenceMode] = useState('Masking Wise');
  const [editor, setEditor] = useState(null);
  const [view, setView] = useState(null);
  const [remove, setRemove] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: preferenceDefaults });
  const { data, isLoading } = useResourceList('coeExamFormPreferences', { page: 1, pageSize: 200 });
  const createPreference = useCreateResource('coeExamFormPreferences');
  const updatePreference = useUpdateResource('coeExamFormPreferences');
  const deletePreference = useDeleteResource('coeExamFormPreferences');
  const rows = data?.items || [];

  useEffect(() => {
    let active = true;
    api.get('/coe/exam-form-preferences/settings')
      .then((response) => {
        if (active) setSettings({ ...settingDefaults, ...(response.data?.data || {}) });
      })
      .catch((error) => toast.error(error?.response?.data?.detail || 'Unable to load marks entry preference settings.'))
      .finally(() => {
        if (active) setSettingsLoading(false);
      });
    return () => { active = false; };
  }, []);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const response = await api.put('/coe/exam-form-preferences/settings', settings);
      setSettings({ ...settingDefaults, ...(response.data?.data || settings) });
      toast.success('Marks entry preference settings saved successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save marks entry preference settings.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const openCreate = () => { reset(preferenceDefaults); setEditor({ item: null }); };
  const openEdit = (item) => {
    reset({
      academicSessionId: item.academicSessionId,
      instituteId: item.instituteId,
      courseId: item.courseId,
      programId: item.programId,
      semesterId: item.semesterId,
      examTypeId: item.examTypeId,
      status: item.status,
    });
    setEditor({ item });
  };
  const closeEditor = () => { setEditor(null); reset(preferenceDefaults); };
  const submitPreference = async (values) => {
    try {
      if (editor?.item) {
        await updatePreference.mutateAsync({ id: editor.item.id, payload: values });
        toast.success('Marks entry preference updated successfully.');
      } else {
        await createPreference.mutateAsync(values);
        toast.success('Marks entry preference created successfully.');
      }
      closeEditor();
    } catch (error) {
      toast.error(error?.response?.data?.detail || error?.message || 'Unable to save marks entry preference.');
    }
  };

  const deleteRow = async () => {
    try {
      await deletePreference.mutateAsync(remove.id);
      toast.success('Marks entry preference deleted successfully.');
      setRemove(null);
    } catch (error) {
      toast.error(error?.message || 'Unable to delete marks entry preference.');
    }
  };

  const toggleStatus = async (row) => {
    try {
      await updatePreference.mutateAsync({ id: row.id, payload: { status: row.status === 'Active' ? 'Inactive' : 'Active' } });
      toast.success('Marks entry preference status updated.');
    } catch (error) {
      toast.error(error?.message || 'Unable to update status.');
    }
  };

  const columns = useMemo(() => [
    { key: 'academicSessionId', label: 'Academic Session' },
    { key: 'instituteId', label: 'Institute' },
    { key: 'courseId', label: 'Course' },
    { key: 'programId', label: 'Program' },
    { key: 'semesterId', label: 'Semester' },
    { key: 'examTypeId', label: 'Exam Type' },
    { key: 'status', label: 'Status', render: (value, row) => (
      <button type="button" onClick={() => toggleStatus(row)} title="Toggle status"><StatusBadge status={value} /></button>
    ) },
    { key: 'action', label: 'Action', sortable: false, render: (_value, row) => (
      <div className="flex items-center justify-end gap-1">
        <button type="button" title="View" onClick={() => setView(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Eye className="h-4 w-4" /></button>
        <button type="button" title="Edit" onClick={() => openEdit(row)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
        <button type="button" title="Delete" onClick={() => setRemove(row)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
      </div>
    ) },
  ], [rows]);

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Form Preferences', to: '/coe/master/exam-form-preferences/settings' }, { label: 'Marks Entry Preference Management' }]} />
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">COE Master</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Marks Entry Preference Management</h1>
        </div>
        <div className="mt-3 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">Marks Entry Preference</span>
              <span className="text-xs text-slate-500">Select the preferred marks entry mode</span>
            </div>
            <select
              value={preferenceMode}
              onChange={(event) => setPreferenceMode(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 md:w-[260px]"
            >
              <option>Masking Wise</option>
              <option>Roll Number Wise</option>
            </select>
          </div>
          <Button onClick={saveSettings} isLoading={settingsSaving} disabled={settingsLoading} className="md:ml-auto">
            <Save className="mr-2 inline h-4 w-4" />Save
          </Button>
        </div>
        <div className="mt-5">
          <DataTable columns={columns} rows={rows} loading={isLoading} placeholder="Search marks entry preferences..." initialPageSize={10} headerClassName="erp-table-header" />
        </div>
        <Modal
          isOpen={Boolean(editor)}
          onClose={closeEditor}
          title={`${editor?.item ? 'Edit' : 'Create'} Marks Entry Preference`}
          footer={
            <>
              <Button variant="secondary" onClick={closeEditor}>Cancel</Button>
              <Button type="submit" form="coe-preference-form" isLoading={createPreference.isPending || updatePreference.isPending}>
                {editor?.item ? 'Save Changes' : 'Create Record'}
              </Button>
            </>
          }
        >
          <form id="coe-preference-form" onSubmit={handleSubmit(submitPreference)}>
            <PreferenceFields register={register} errors={errors} />
          </form>
        </Modal>
        <Modal
          isOpen={Boolean(view)}
          onClose={() => setView(null)}
          title="Marks Entry Preference Details"
          footer={<Button variant="secondary" onClick={() => setView(null)}>Close</Button>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(view || {}).map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{key}</p>
                <p className="mt-1 text-sm text-slate-800">{String(value ?? '—')}</p>
              </div>
            ))}
          </div>
        </Modal>
        <ConfirmDialog
          open={Boolean(remove)}
          title="Delete marks entry preference?"
          description="This record will be removed from active results. Please confirm this action."
          onCancel={() => setRemove(null)}
          onConfirm={deleteRow}
          confirmLabel={deletePreference.isPending ? 'Deleting...' : 'Delete'}
        />
      </div>
    </div>
  );
}
