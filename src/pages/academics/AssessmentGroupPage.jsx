import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
import Button from '../../components/ui/Button.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import Modal from '../../components/ui/Modal.jsx';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import { collegeOptions as sharedCollegeNames } from '../../services/subjectMappingTypes.js';
import { useResourceList, useCreateResource, useUpdateResource, useDeleteResource } from '../../hooks/useResourceHooks';

const INITIAL_FORM = {
  name: '',
  collegeId: '',
  courseId: '',
  batchId: '',
  gradeSetupId: '',
  weightage: '',
  editResult: false,
  items: [],
};

const DEFAULT_ITEM = () => ({ id: `new-${Date.now()}-${Math.random()}`, assessment_name: '', assessment_model: '', display_name: '', sequence_no: '', result_declared: false, include_in_total: false, display_value: false, show_graph: false, passing_required: false });

export default function AssessmentGroupPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [form, setForm] = useState({ ...INITIAL_FORM, items: [DEFAULT_ITEM()] });
  const [filters, setFilters] = useState({ college: 'ALL' });

  const { data: groupsData, isLoading } = useResourceList('assessmentGroup', { page: 1, pageSize: 200 });
  const { data: coursesData } = useResourceList('courses', { page: 1, pageSize: 200 });
  const { data: classesData } = useResourceList('classes', { page: 1, pageSize: 200 });
  const { data: gradeSetupsData } = useResourceList('assessmentGradeSetups', { page: 1, pageSize: 200 });

  const createMutation = useCreateResource('assessmentGroup');
  const updateMutation = useUpdateResource('assessmentGroup');
  const deleteMutation = useDeleteResource('assessmentGroup');
  const qc = useQueryClient();

  useEffect(() => { document.title = 'AssessmentGroup - Academics'; }, []);

  const departmentOptions = useMemo(() => sharedCollegeNames.map((c) => ({ value: c, label: c })), []);
  const courseOptions = useMemo(() => (coursesData?.items || []).map((c) => ({ value: String(c.id), label: c.name })), [coursesData]);
  const batchOptions = useMemo(() => (classesData?.items || []).map((c) => ({ value: String(c.id), label: c.name })), [classesData]);
  const gradeSetupOptions = useMemo(() => (gradeSetupsData?.items || []).map((g) => ({ value: String(g.id), label: g.name })), [gradeSetupsData]);

  const openCreate = () => { setEditing(null); setForm({ ...INITIAL_FORM, items: [DEFAULT_ITEM()] }); setShowModal(true); };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      collegeId: row.college_id || '',
      courseId: row.course_id || '',
      batchId: row.batch_id || '',
      gradeSetupId: row.grade_setup_id || '',
      weightage: row.weightage || '',
      editResult: row.edit_result || false,
      items: (row.items || []).map((it) => ({ ...it })),
    });
    setShowModal(true);
  };

  const handleFormChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const addItem = () => setForm((s) => ({ ...s, items: [...s.items, DEFAULT_ITEM()] }));
  const removeItem = (id) => setForm((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));

  const buildPayload = () => ({
    name: form.name,
    college_id: form.collegeId,
    course_id: form.courseId,
    batch_id: form.batchId,
    grade_setup_id: form.gradeSetupId,
    weightage: Number(form.weightage || 0),
    edit_result: !!form.editResult,
    items: form.items.map((it) => ({
      assessment_name: it.assessment_name,
      assessment_model: it.assessment_model,
      display_name: it.display_name,
      sequence_no: it.sequence_no ? Number(it.sequence_no) : null,
      result_declared: !!it.result_declared,
      include_in_total: !!it.include_in_total,
      display_value: !!it.display_value,
      show_graph: !!it.show_graph,
      passing_required: !!it.passing_required,
    })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = buildPayload();
    try {
      if (editing) await updateMutation.mutateAsync({ id: editing.id, payload });
      else await createMutation.mutateAsync(payload);
      setShowModal(false);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (row) => { if (!window.confirm('Delete record?')) return; await deleteMutation.mutateAsync(row.id); };

  const rows = (groupsData?.items || []).map((g, idx) => ([
    <input type="checkbox" key={`cb-${g.id}`} checked={selectedRowId === g.id} onChange={(e) => setSelectedRowId(e.target.checked ? g.id : null)} className="h-4 w-4 rounded border-slate-300 text-sky-600" />,
    idx + 1,
    g.name || '—',
    g.college_id || '—',
    g.course_id || '—',
    g.batch_id || '—',
    g.grade_setup_id || '—',
    g.weightage ?? '—',
    <div key={`actions-${g.id}`} className="flex gap-2">
      <button onClick={() => openEdit(g)} className="btn"> <Edit3 /> </button>
      <button onClick={() => handleDelete(g)} className="btn"> <Trash2 /> </button>
    </div>,
  ]));

  const columns = ['','S No.', 'Name', 'College', 'Course', 'Batch', 'Grade Setup', 'Weightage', 'Actions'];

  return (
    <div className="min-h-screen w-full px-[12px] pb-8 pt-4 lg:px-6">
      <div className="mb-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'Academics Setup', to: '/settings/institute/academics' }, { label: 'AssessmentGroup' }]} />
        <div className="mt-3 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">AssessmentGroup</h1>
          <div className="flex items-center gap-3">
            <Button variant="dark" onClick={async () => {
              let idToCopy = selectedRowId;
              if (!idToCopy) {
                const pick = window.prompt('Enter the ID of the AssessmentGroup to copy (or Cancel)');
                if (!pick) return;
                idToCopy = Number(pick);
              }
              if (!idToCopy || Number.isNaN(Number(idToCopy))) {
                alert('Invalid ID');
                return;
              }
              if (!window.confirm('Are you sure you want to copy this AssessmentGroup?')) return;
              try {
                // Use configured API client so production uses VITE_API_BASE_URL
                const { default: api } = await import('../../api/axios.js');
                const resp = await api.post(`/assessment-group/${idToCopy}/copy`);
                if (!resp || resp.status >= 400) throw new Error('Copy failed');
                // invalidate list so it refreshes via React Query
                qc.invalidateQueries({ queryKey: ['assessmentGroup'], exact: false });
              } catch (err) { console.error(err); alert('Copy failed'); }
            }}>Copy</Button>
            <Button variant="primary" onClick={openCreate}><Plus className="h-4 w-4" /> Add New AssessmentGroup</Button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm mb-4">
        <div className="grid grid-cols-2 items-center">
          <div>
            <SearchableSelect options={[{ value: 'ALL', label: 'Select College' }, ...departmentOptions]} value={filters.college} onChange={(v) => setFilters((s) => ({ ...s, college: v }))} />
          </div>
          <div className="flex justify-end">
            <Button variant="dark">Go →</Button>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-white/95 p-4 shadow-sm">
        <DataTable columns={columns} rows={rows} loading={isLoading} placeholder="No Records found !" />
      </div>

      <Modal title={editing ? 'Edit AssessmentGroup' : 'Add New AssessmentGroup'} isOpen={showModal} onClose={() => setShowModal(false)} footer={<><Button onClick={() => setShowModal(false)}>Cancel</Button><Button onClick={handleSubmit} variant="primary">{editing ? 'Update' : 'Add'}</Button></>}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm">Enter Name</label>
              <input required value={form.name} onChange={(e) => handleFormChange('name', e.target.value)} className="w-full rounded-2xl border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm">College</label>
              <SearchableSelect options={departmentOptions} value={form.collegeId} onChange={(v) => handleFormChange('collegeId', v)} required />
            </div>
            <div>
              <label className="block text-sm">Select Course</label>
              <SearchableSelect options={courseOptions} value={form.courseId} onChange={(v) => handleFormChange('courseId', v)} required />
            </div>
            <div>
              <label className="block text-sm">Batch</label>
              <SearchableSelect options={batchOptions} value={form.batchId} onChange={(v) => handleFormChange('batchId', v)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Select Grade Setup</label>
              <SearchableSelect options={gradeSetupOptions} value={form.gradeSetupId} onChange={(v) => handleFormChange('gradeSetupId', v)} required />
            </div>
            <div>
              <label className="block text-sm">Enter Weightage</label>
              <input type="number" min={0} max={100} value={form.weightage} onChange={(e) => handleFormChange('weightage', e.target.value)} className="w-full rounded-2xl border px-3 py-2" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.editResult} onChange={(e) => handleFormChange('editResult', e.target.checked)} /> Edit Result</label>
          </div>

          <div>
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Result Declared</span>
                  <button type="button" className="ml-2 mt-0 inline-flex items-center rounded-full px-2 py-1" onClick={() => { /* read-only summary */ }}>
                    { form.items.find((i) => i.result_declared) ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Include In Total</span>
                  <button type="button" className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ form.items.find((i) => i.include_in_total) ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Display Value</span>
                  <button type="button" className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ form.items.find((i) => i.display_value) ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Show Graph</span>
                  <button type="button" className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ form.items.find((i) => i.show_graph) ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Passing Required</span>
                  <button type="button" className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ form.items.find((i) => i.passing_required) ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                </div>
              </div>
          </div>

          <div className="border-t pt-3">
            <div className="mb-2 flex justify-between items-center">
              <div className="text-sm font-semibold">Assessment Items</div>
              <Button onClick={addItem} variant="dark"><Plus /> ADD FORMULAE</Button>
            </div>
            <div className="space-y-3">
              {form.items.map((it) => (
                <div key={it.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-1"><input type="checkbox" /></div>
                  <div className="col-span-2"><input value={it.assessment_name} onChange={(e) => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, assessment_name: e.target.value } : x) })); }} className="w-full rounded-2xl border px-2 py-1" /></div>
                  <div className="col-span-2"><input value={it.assessment_model} onChange={(e) => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, assessment_model: e.target.value } : x) })); }} className="w-full rounded-2xl border px-2 py-1" /></div>
                  <div className="col-span-2"><input value={it.display_name} onChange={(e) => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, display_name: e.target.value } : x) })); }} className="w-full rounded-2xl border px-2 py-1" /></div>
                  <div className="col-span-1"><input type="number" value={it.sequence_no} onChange={(e) => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, sequence_no: e.target.value } : x) })); }} className="w-full rounded-2xl border px-2 py-1" /></div>
                  <div className="col-span-4 flex gap-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Result Declared</span>
                      <button type="button" onClick={() => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, result_declared: !x.result_declared } : x) })); }} className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ it.result_declared ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Include In Total</span>
                      <button type="button" onClick={() => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, include_in_total: !x.include_in_total } : x) })); }} className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ it.include_in_total ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Display Value</span>
                      <button type="button" onClick={() => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, display_value: !x.display_value } : x) })); }} className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ it.display_value ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Show Graph</span>
                      <button type="button" onClick={() => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, show_graph: !x.show_graph } : x) })); }} className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ it.show_graph ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Passing Required</span>
                      <button type="button" onClick={() => { setForm((s) => ({ ...s, items: s.items.map((x) => x.id === it.id ? { ...x, passing_required: !x.passing_required } : x) })); }} className="ml-2 inline-flex items-center rounded-full px-2 py-1">{ it.passing_required ? <ToggleRight className="h-5 w-5 text-emerald-600" /> : <ToggleLeft className="h-5 w-5 text-slate-400" /> }</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
