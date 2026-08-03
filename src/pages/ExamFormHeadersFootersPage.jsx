import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import api from '../api/axios.js';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';

const sections = ['Header', 'Footer'];
const templateTypes = ['Regular', 'Reappear', 'Special'];
const emptyForm = { instituteId: '', examTypeId: '', htmlContent: '', status: 'Active' };

function slotKey(sectionType, templateType) {
  return `${sectionType}-${templateType}`;
}

export default function ExamFormHeadersFootersPage() {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: emptyForm });

  const templateMap = useMemo(() => new Map(templates.map((item) => [slotKey(item.sectionType, item.templateType), item])), [templates]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/coe/exam-form-headers-footers');
      setTemplates(response.data?.data || []);
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to load header/footer templates.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);

  const openEditor = (sectionType, templateType, item = null) => {
    reset(item ? { instituteId: item.instituteId, examTypeId: item.examTypeId, htmlContent: item.htmlContent, status: item.status } : emptyForm);
    setModalState({ sectionType, templateType, item });
  };

  const closeEditor = () => setModalState(null);

  const saveTemplate = async (values) => {
    const payload = { ...values, instituteId: Number(values.instituteId), examTypeId: Number(values.examTypeId), sectionType: modalState.sectionType, templateType: modalState.templateType };
    setIsSaving(true);
    try {
      if (modalState.item) {
        await api.put(`/coe/exam-form-headers-footers/${modalState.item.id}`, payload);
      } else {
        await api.post('/coe/exam-form-headers-footers', payload);
      }
      toast.success(`${modalState.sectionType} ${modalState.templateType} saved successfully.`);
      closeEditor();
      await loadTemplates();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveAllChanges = async () => {
    setIsSaving(true);
    try {
      await Promise.all(templates.map((item) => api.put(`/coe/exam-form-headers-footers/${item.id}`, {
        htmlContent: item.htmlContent,
        status: item.status,
      })));
      toast.success('All header/footer changes are saved.');
      await loadTemplates();
    } catch (error) {
      toast.error(error?.response?.data?.detail || 'Unable to save all header/footer changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] rounded-[24px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_55%,#f8fafc_100%)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.06)] lg:p-5">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/95 p-4 shadow-inner sm:p-6">
        <Breadcrumb items={[{ label: 'Dashboard', to: '/' }, { label: 'COE Master', to: '/settings/coe' }, { label: 'Exam Form Preferences', to: '/coe/configuration' }, { label: 'Exam Form Headers / Footers' }]} />
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-600">COE Master</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Exam Form Headers / Footers</h1>
          </div>
          <Button onClick={saveAllChanges} isLoading={isSaving}><Save className="mr-2 inline h-4 w-4" />Save</Button>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {sections.map((sectionType) => (
            <section key={sectionType} className={sectionType === 'Footer' ? 'mt-8 border-t border-slate-200 pt-8' : ''}>
              <h2 className="text-xl font-semibold text-slate-950">{sectionType}s</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {templateTypes.map((templateType) => {
                  const item = templateMap.get(slotKey(sectionType, templateType));
                  return <div key={templateType} className="min-h-[170px] rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-slate-800">{templateType}</h3>{item && <button type="button" title={`Edit ${templateType} ${sectionType}`} onClick={() => openEditor(sectionType, templateType, item)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-emerald-600"><Pencil className="h-4 w-4" /></button>}</div>
                    <p className="mt-3 min-h-[54px] line-clamp-3 whitespace-pre-wrap text-xs text-slate-500">{isLoading ? 'Loading...' : item?.htmlContent || `No ${templateType.toLowerCase()} ${sectionType.toLowerCase()} configured.`}</p>
                    <button type="button" onClick={() => openEditor(sectionType, templateType, item)} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"><Plus className="h-4 w-4" />{item ? `Edit ${templateType} ${sectionType}` : `Add ${templateType} ${sectionType}`}</button>
                  </div>;
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <Modal isOpen={Boolean(modalState)} onClose={closeEditor} title={`${modalState?.item ? 'Edit' : 'Add'} ${modalState?.templateType || ''} ${modalState?.sectionType || ''}`} footer={<><Button variant="secondary" onClick={closeEditor}>Cancel</Button><Button type="submit" form="header-footer-form" isLoading={isSaving}>Save</Button></>}>
        <form id="header-footer-form" onSubmit={handleSubmit(saveTemplate)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Institute ID</span><input type="number" min="1" {...register('instituteId', { required: 'Institute is required', min: { value: 1, message: 'Institute is required' } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />{errors.instituteId && <span className="mt-1 block text-xs text-rose-600">{errors.instituteId.message}</span>}</label><label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Exam Type ID</span><input type="number" min="1" {...register('examTypeId', { required: 'Exam type is required', min: { value: 1, message: 'Exam type is required' } })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500" />{errors.examTypeId && <span className="mt-1 block text-xs text-rose-600">{errors.examTypeId.message}</span>}</label></div>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">HTML Content</span><textarea rows={10} {...register('htmlContent', { required: 'HTML content is required' })} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs outline-none focus:border-emerald-500" />{errors.htmlContent && <span className="mt-1 block text-xs text-rose-600">{errors.htmlContent.message}</span>}</label>
          <label><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">Status</span><select {...register('status')} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"><option>Active</option><option>Inactive</option><option>Draft</option></select></label>
        </form>
      </Modal>
    </div>
  );
}
