import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function SidebarMenuItem({ item, isExpanded, onToggle, onNavigate, activePath }) {
  const Icon = item.icon;

  if (item.children) {
    return (
      <div>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-200 transition hover:bg-white/10"
          onClick={() => onToggle(item.id)}
        >
          <span className="flex items-center gap-2">
            {Icon ? <Icon className="h-4 w-4" /> : null}
            <span>{item.label}</span>
          </span>
          <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
        {isExpanded ? (
          <div className="mt-1 space-y-1 pl-2">
            {item.children.map((child) => (
              <SidebarMenuItem
                key={child.id}
                item={child}
                isExpanded={isExpanded}
                onToggle={onToggle}
                onNavigate={onNavigate}
                activePath={activePath}
              />
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  if (item.disabled) {
    return (
      <div className="flex cursor-not-allowed items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span>{item.label}</span>
      </div>
    );
  }

  const isActive = Boolean(item.to && activePath === item.to);

  return (
    <Link
      to={item.to || '/'}
      onClick={onNavigate}
      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-emerald-500/20 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{item.label}</span>
      {item.comingSoon ? <span className="ml-auto text-[10px] uppercase tracking-[0.24em] text-emerald-200/70">Soon</span> : null}
    </Link>
  );
}
