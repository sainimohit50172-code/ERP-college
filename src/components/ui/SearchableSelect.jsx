import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export default function SearchableSelect({ options = [], value = '', onChange = () => {}, placeholder = '', required = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [menuStyle, setMenuStyle] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);
  const listRef = useRef(null);
  const menuRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options.filter((o) => !q || String(o.label).toLowerCase().includes(q));
  }, [options, query]);

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  useEffect(() => setHighlight(0), [query, open]);

  useEffect(() => {
    if (!open || !ref.current) return;
    const updatePosition = () => {
      const rect = ref.current.getBoundingClientRect();
      setMenuStyle({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    const node = listRef.current.children[highlight];
    if (node) node.scrollIntoView({ block: 'nearest' });
  }, [highlight]);

  const handleKeyDown = (e) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[highlight];
      if (item) { onChange(item.value); setOpen(false); setQuery(''); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const menu = open ? (
    <div
      ref={menuRef}
      style={{ top: menuStyle.top, left: menuStyle.left, width: menuStyle.width }}
      className="fixed z-[9999] max-h-52 overflow-auto rounded-md border border-slate-200 bg-white shadow-sm"
    >
      <div ref={listRef}>
        {filtered.map((opt, idx) => (
          <button
            key={opt.value}
            type="button"
            onMouseDown={(ev) => ev.preventDefault()}
            onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
            className={`w-full px-3 py-2 text-left text-sm ${idx === highlight ? 'bg-slate-100' : 'hover:bg-slate-50'} text-slate-700`}
          >
            {opt.label}
          </button>
        ))}
        {filtered.length === 0 && <div className="p-3 text-sm text-slate-500">No matches</div>}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          value={open ? query : (value || '')}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="h-10 w-full rounded-[6px] border border-slate-200 px-3 pr-10 text-sm text-slate-900 outline-none bg-white"
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
      {menu && createPortal(menu, document.body)}
    </div>
  );
}
