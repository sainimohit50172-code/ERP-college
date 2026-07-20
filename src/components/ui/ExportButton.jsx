import { FileSpreadsheet, FileText, Printer } from 'lucide-react';

export default function ExportButton({ onExcel, onPdf, onPrint }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onExcel}
        className="hover-gradient-border inline-flex items-center gap-2 rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export XLS
      </button>
      <button
        type="button"
        onClick={onPdf}
        className="hover-gradient-border inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>
      <button
        type="button"
        onClick={onPrint}
        className="hover-gradient-border inline-flex items-center gap-2 rounded-3xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
