import { Trash2 } from 'lucide-react';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';
import TeacherSelect from './TeacherSelect.jsx';

export default function SubjectBlock({
  block,
  subjectOptions,
  assessmentOptions,
  modeOptions,
  typeOptions,
  teacherOptions,
  onChange,
  onDelete,
  _disabled = false,
}) {
  return (
    <div className="relative overflow-hidden rounded-[8px] border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md hover:border-slate-300">
      <div className="mb-2 text-sm font-medium text-slate-700">Subject</div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-7">
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Select Subject</div>
          <SearchableSelect
            options={subjectOptions}
            value={block.subject}
            onChange={(value) => onChange('subject', value)}
            placeholder="Search subject"
            required
            className="h-[40px]"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Assessment Model</div>
          <SearchableSelect
            options={assessmentOptions}
            value={block.assessmentModel}
            onChange={(value) => onChange('assessmentModel', value)}
            placeholder="Model"
            required
            className="h-[40px]"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Subject Mode</div>
          <SearchableSelect
            options={modeOptions}
            value={block.mode}
            onChange={(value) => onChange('mode', value)}
            placeholder="Mode"
            required
            className="h-[40px]"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Subject Type</div>
          <SearchableSelect
            options={typeOptions}
            value={block.type}
            onChange={(value) => onChange('type', value)}
            placeholder="Type"
            required
            className="h-[40px]"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Seq</div>
          <input
            type="number"
            min="1"
            value={block.sequence}
            onChange={(event) => onChange('sequence', Number(event.target.value))}
            className="w-full rounded-[8px] border border-slate-200 bg-white px-3 h-[38px] text-[13px] text-slate-900 outline-none transition focus:border-slate-300"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Count</div>
          <input
            type="number"
            min="1"
            value={block.count}
            onChange={(event) => onChange('count', Number(event.target.value))}
            className="w-full rounded-[8px] border border-slate-200 bg-white px-3 h-[38px] text-[13px] text-slate-900 outline-none transition focus:border-slate-300"
          />
        </div>
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={onDelete}
            className="ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent bg-white text-slate-600 transition hover:bg-rose-100 hover:text-rose-700"
            title="Delete subject"
            aria-label="Delete subject"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mt-3 grid gap-3 lg:grid-cols-[55%_35%_auto] items-center">
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Display Name</div>
          <input
            type="text"
            value={block.displayName}
            onChange={(event) => onChange('displayName', event.target.value)}
            className="w-full rounded-[8px] border border-slate-200 bg-white px-3 h-[40px] text-[13px] text-slate-900 outline-none"
            placeholder="Display name"
          />
        </div>
        <div>
          <div className="text-[12px] font-medium text-slate-500 mb-1">Select Teacher</div>
          <div className="w-full">
            <TeacherSelect
              options={teacherOptions}
              value={block.teacher}
              onChange={(value) => onChange('teacher', value)}
            />
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="text-[12px] font-medium text-slate-500 mr-3">Visible</div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={block.visible}
              onChange={(event) => onChange('visible', event.target.checked)}
              className="sr-only"
            />
            <span className={`w-10 h-5 inline-block rounded-full transition-colors ${block.visible ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <span className={`absolute left-0.5 top-0.5 inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${block.visible ? 'translate-x-4' : 'translate-x-0'}`} />
          </label>
        </div>
      </div>
    </div>
  );
}
