import PropTypes from 'prop-types';

export default function ToggleField({
  id,
  label,
  checked,
  onChange,
  disabled,
  className = '',
  labelClassName = '',
  description,
  error,
}) {
  const inputId = id;

  return (
    <div className={`w-full min-w-0 ${className}`.trim()}>
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 transition focus-within:ring-2 focus-within:ring-emerald-300 ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${labelClassName}`.trim()}
      >
        <span className="flex-1">
          <span className="block font-medium text-slate-700">{label}</span>
          {description ? <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span> : null}
        </span>
        <span className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-slate-300 transition duration-200 ease-in-out">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.checked)}
            className="peer absolute h-full w-full cursor-pointer opacity-0"
          />
          <span className="pointer-events-none inline-block h-5 w-5 translate-x-0 rounded-full bg-white shadow transition duration-200 ease-in-out peer-checked:translate-x-5 peer-checked:bg-emerald-500"></span>
        </span>
      </label>
      {error ? <p className="mt-2 text-xs leading-5 text-rose-600">{error}</p> : null}
    </div>
  );
}

ToggleField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  description: PropTypes.node,
  error: PropTypes.node,
};
