import { useRef } from 'react';
import SearchableSelect from '../../components/ui/SearchableSelect.jsx';

export default function TeacherSelect({ options = [], value = '', onChange = () => {} }) {
  const wrapRef = useRef(null);

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    // Focus the internal input so user can type immediately
    const input = wrapRef.current?.querySelector('input[role="combobox"]');
    if (input) {
      input.focus();
      // open the dropdown by simulating focus/input
      const event = new Event('focus');
      input.dispatchEvent(event);
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <SearchableSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder="Search teacher"
        className="h-[40px]"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear teacher"
          className="absolute right-9 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
