import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
          {item.to ? (
            <Link to={item.to} className="text-slate-600 transition hover:text-slate-900">
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-slate-900">{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
        </span>
      ))}
    </nav>
  );
}
