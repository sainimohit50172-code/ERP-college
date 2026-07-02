import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, XCircle, Trash2 } from 'lucide-react';
import SearchResultItem from './SearchResultItem.jsx';

const STORAGE_KEY = 'erp-global-search-recent';

function readRecentSearches() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentSearches(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 10)));
  } catch {
    // ignore storage failure
  }
}

function groupResults(results) {
  return results.reduce((groups, item) => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
    return groups;
  }, {});
}

export default function GlobalSearch({ className = 'w-full' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());
  const [searchService, setSearchService] = useState(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const debounceRef = useRef(null);

  const displayRecent = open && !query.trim();
  const displayResults = open && query.trim();
  const hasResults = results.length > 0;
  const groupedResults = useMemo(() => groupResults(results), [results]);
  const activeItem = useMemo(() => {
    const items = displayRecent ? recentSearches : results;
    return items[activeIndex] || null;
  }, [activeIndex, displayRecent, recentSearches, results]);

  const loadService = useCallback(async () => {
    if (searchService) return searchService;
    try {
      const module = await import('../../api/searchService.js');
      const service = module.searchAll;
      setSearchService(() => service);
      return service;
    } catch {
      return null;
    }
  }, [searchService]);

  const runSearch = useCallback(async (text) => {
    const service = await loadService();
    if (!service) {
      setResults([]);
      setLoading(false);
      return;
    }
    try {
      const data = await service(text);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [loadService]);

  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setLoading(false);
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      runSearch(query.trim());
      setActiveIndex(-1);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [open, query, runSearch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (open && panelRef.current && !panelRef.current.contains(event.target) && !inputRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  useEffect(() => {
    saveRecentSearches(recentSearches);
  }, [recentSearches]);

  const handleQueryChange = (value) => {
    setQuery(value);
    setOpen(true);
  };

  const handleSelectResult = (item) => {
    if (!item) return;
    if (displayRecent) {
      const text = item;
      setQuery(text);
      setOpen(true);
      setActiveIndex(-1);
      return;
    }
    setOpen(false);
    setQuery('');
    setActiveIndex(-1);
    const term = item.title;
    const newRecents = [term, ...recentSearches.filter((entry) => entry !== term)].slice(0, 10);
    setRecentSearches(newRecents);
    navigate(item.route || '/');
  };

  const handleClearRecent = (term) => {
    setRecentSearches((items) => items.filter((item) => item !== term));
  };

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  const handleKeyDown = (event) => {
    const items = displayRecent ? recentSearches : results;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, items.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && items[activeIndex]) {
        handleSelectResult(items[activeIndex]);
      } else if (displayRecent && recentSearches.length > 0) {
        handleSelectResult(recentSearches[0]);
      } else if (displayResults && results.length > 0) {
        handleSelectResult(results[0]);
      }
    }
    if (event.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className={`${className} relative`} ref={panelRef}>
      <label className="sr-only" htmlFor="global-search-input">Search ERP</label>
      <div className="relative w-full rounded-3xl border border-slate-200/80 bg-white px-3 py-2 shadow-sm transition duration-150 ease-out focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          id="global-search-input"
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          aria-autocomplete="list"
          aria-controls="global-search-results"
          aria-expanded={open}
          aria-activedescendant={activeItem ? `global-search-item-${activeIndex}` : undefined}
          placeholder="Search college ERP..."
          className="w-full border-none bg-transparent pl-11 pr-10 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
            aria-label="Clear search"
          >
            <XCircle className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-3 max-h-[480px] overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_35px_80px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200/70 px-4 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900">Global search</p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Live</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500">Search across students, faculty, courses, fees, exams, inventory, transport, hostels, library and more.</p>
          </div>

          <div id="global-search-results" role="listbox" className="max-h-[380px] overflow-y-auto px-4 py-3 sm:px-5">
            {loading ? (
              <div className="rounded-[22px] bg-slate-50 p-6 text-center text-sm text-slate-500">Searching...</div>
            ) : displayRecent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Recent searches</p>
                  {recentSearches.length > 0 ? (
                    <button type="button" onClick={handleClearAll} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200">
                      <Trash2 className="h-4 w-4" /> Clear all
                    </button>
                  ) : null}
                </div>
                {recentSearches.length === 0 ? (
                  <div className="rounded-[22px] bg-slate-50 p-6 text-center text-sm text-slate-500">No recent searches yet. Start typing to search the ERP.</div>
                ) : (
                  <div className="space-y-2">
                    {recentSearches.map((searchTerm, index) => (
                      <div key={searchTerm} className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <button
                          type="button"
                          className="text-left text-sm text-slate-700"
                          onClick={() => handleSelectResult(searchTerm)}
                          onKeyDown={handleKeyDown}
                          id={`global-search-item-${index}`}
                          role="option"
                          aria-selected={activeIndex === index}
                        >
                          {searchTerm}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClearRecent(searchTerm)}
                          className="rounded-full p-1 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                          aria-label={`Remove recent search ${searchTerm}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : query.trim() ? (
              <div className="space-y-4">
                {hasResults ? (
                  Object.entries(groupedResults).map(([category, categoryItems]) => (
                    <div key={category} className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category}</p>
                      <div className="space-y-2">
                        {categoryItems.map((item, _index) => (
                          <SearchResultItem
                            key={item.id}
                            id={`global-search-item-${results.indexOf(item)}`}
                            item={item}
                            query={query}
                            isActive={results.indexOf(item) === activeIndex}
                            onClick={() => handleSelectResult(item)}
                            onKeyDown={handleKeyDown}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[22px] bg-slate-50 p-6 text-center text-sm text-slate-500">No Results Found for <span className="font-semibold">{`"${query}"`}</span>.</div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
