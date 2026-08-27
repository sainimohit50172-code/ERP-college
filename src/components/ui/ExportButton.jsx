import { FileSpreadsheet, FileText, Printer, Download } from 'lucide-react';

export default function ExportButton({ onExcel, onCsv, onPdf, onPrint }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onExcel}
        className="btn btn-secondary inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Export XLS
      </button>
      <button
        type="button"
        onClick={onCsv}
        className="btn btn-secondary inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <Download className="h-4 w-4" />
        Export CSV
      </button>
      <button
        type="button"
        onClick={onPdf}
        className="btn btn-secondary inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <FileText className="h-4 w-4" />
        Export PDF
      </button>
      <button
        type="button"
        onClick={onPrint}
        className="btn btn-secondary inline-flex items-center gap-2 rounded-3xl px-4 py-3 text-sm font-semibold transition hover:bg-slate-50"
        style={{ '--hover-gradient-radius': '24px' }}
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
