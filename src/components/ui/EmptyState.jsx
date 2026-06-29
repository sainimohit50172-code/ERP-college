import { FileSearch } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description = 'Try adjusting your search or filter to find what you need.', action }) {
  return (
    <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-8 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-sm">
        <FileSearch className="h-7 w-7 text-slate-500" />
      </div>
      <h2 className="mt-6 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
