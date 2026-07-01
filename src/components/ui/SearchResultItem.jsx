import { BookOpen, Briefcase, Building, CheckCircle2, Clipboard, Database, DollarSign, Home, Search, School, Truck, UserPlus, Users } from 'lucide-react';

const categoryIcons = {
  Students: Users,
  Faculty: School,
  Departments: Building,
  Courses: BookOpen,
  Subjects: BookOpen,
  Admissions: UserPlus,
  Attendance: CheckCircle2,
  Fees: DollarSign,
  Examination: Clipboard,
  Inventory: Database,
  Transport: Truck,
  Hostel: Home,
  Library: BookOpen,
  Employees: Briefcase,
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.split(regex).map((part, index) =>
    part.match(regex) ? (
      <mark key={index} className="rounded bg-emerald-100 px-1 text-emerald-700">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export default function SearchResultItem({ item, query, isActive, onClick, onKeyDown, id }) {
  const Icon = categoryIcons[item.category] || Search;

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`group flex w-full flex-col gap-1 rounded-[18px] border px-4 py-4 text-left transition ${
        isActive ? 'border-emerald-300 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
      role="option"
      aria-selected={isActive}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-950">{highlightText(item.title, query)}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.category}</p>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-500">{highlightText(item.description, query)}</p>
    </button>
  );
}
