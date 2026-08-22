import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExcelJS from 'exceljs';
import { ArrowLeft,  FileSpreadsheet, UploadCloud } from 'lucide-react';
import Breadcrumb from '../components/ui/Breadcrumb.jsx';

function normalizeCellValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
}

function parseCsvRows(text) {
  const rows = [];
  let current = '';
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }
      row.push(current);
      if (row.some((cell) => normalizeCellValue(cell) !== '')) {
        rows.push(row);
      }
      row = [];
      current = '';
      continue;
    }

    current += char;
  }

  if (current.length || row.length) {
    row.push(current);
    if (row.some((cell) => normalizeCellValue(cell) !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function toTableRows(rawRows) {
  if (!rawRows.length) return [];

  const cleanedRows = rawRows
    .filter((row) => Array.isArray(row) && row.some((cell) => normalizeCellValue(cell) !== ''))
    .map((row) => row.map((cell) => normalizeCellValue(cell)));

  if (!cleanedRows.length) return [];

  const [headerRow, ...dataRows] = cleanedRows;
  const headers = headerRow.map((cell, index) => (cell || `Column ${index + 1}`));

  return dataRows.map((row) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = row[index] ?? '';
    });
    return entry;
  });
}

export default function FeeExcelUploadPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [uploadedRows, setUploadedRows] = useState([]);
  const [fileName, setFileName] = useState('');

  const columns = uploadedRows.length
    ? Object.keys(uploadedRows[0]).map((key) => ({ key, label: key || 'Unnamed Column' }))
    : [];

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      let parsedRows = [];

      if (extension === 'csv') {
        const text = await file.text();
        parsedRows = parseCsvRows(text);
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];
        const values = worksheet.getSheetValues();
        parsedRows = values.filter((row) => Array.isArray(row) && row.some((cell) => normalizeCellValue(cell) !== ''));
      }

      const tableRows = toTableRows(parsedRows);
      setUploadedRows(tableRows);
      setFileName(file.name);
      event.target.value = null;
    } catch (error) {
      setUploadedRows([]);
      setFileName(file.name);
      console.error('Excel upload failed', error);
      window.alert('The selected file could not be read. Please upload a valid .xlsx, .xls, or .csv file.');
      event.target.value = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-5">
        <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm">
          <div className="px-5 pt-5">
            <div className="mb-4 flex items-center gap-3">
            <Breadcrumb items={[
              { label: 'Dashboard', to: '/' },
              { label: 'Fee Structure', to: '/settings/fee-structure' },
              { label: 'Fee Excel Upload' },
            ]} />
          </div>

          <div className="flex flex-col gap-3 px-5 pb-5 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Fee Excel Upload
              </h1>
            </div>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#05331e] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#042d1a]"
            >
              <UploadCloud className="h-4 w-4" />
              Upload Excel
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleUpload}
          />

          <div className="min-h-[560px] bg-slate-50">
            {uploadedRows.length === 0 ? (
              <div className="h-[560px] w-full bg-slate-50" />
            ) : (
              <div className="px-5 pb-6 pt-2">
                <div className="mb-4 flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <FileSpreadsheet className="h-5 w-5 text-slate-700" />
                  <span className="text-sm font-medium text-slate-700">{fileName}</span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-center text-sm text-slate-700">
                      <thead className="bg-[#05331e]">
                        <tr>
                          {columns.map((column, index) => (
                            <th
                              key={column.key}
                              className={`px-6 py-4 font-bold uppercase tracking-wide text-white ${
                                index < columns.length - 1 ? 'border-r-2 border-white' : ''
                              }`}
                            >
                              {column.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedRows.map((row, rowIndex) => (
                          <tr key={`row-${rowIndex}`} className="border-b border-slate-200 hover:bg-slate-50">
                            {columns.map((column, index) => (
                              <td
                                key={`${rowIndex}-${column.key}`}
                                className={`px-6 py-4 text-center font-medium text-slate-900 ${
                                  index < columns.length - 1 ? 'border-r-2 border-white' : ''
                                }`}
                              >
                                {row[column.label] || ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
