import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function TablePagination({ page, pageCount, onPageChange }) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[32px] border border-slate-200/70 bg-white/95 px-4 py-3 text-sm text-slate-600 shadow-sm">
      <div className="text-slate-500">Page {page} of {pageCount}</div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        {pages.map((pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`rounded-2xl px-3 py-2 transition ${pageNumber === page ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-emerald-50'}`}
            aria-current={pageNumber === page ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-slate-50 px-3 py-2 text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
