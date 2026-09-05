import PropTypes from 'prop-types';
import React from 'react';

export default function FormField({
  label,
  children,
  hint,
  error,
  required = false,
  className = '',
  labelClassName = '',
  contentClassName = '',
  htmlFor,
  id,
  name,
}) {
  const generatedFieldId = React.useId().replace(/:/g, '');
  const childId = React.isValidElement(children) ? children.props.id : undefined;
  const fieldId = id || htmlFor || childId || `form-field-${generatedFieldId}`;
  const hintId = fieldId ? `${fieldId}-hint` : undefined;
  const errorId = fieldId ? `${fieldId}-error` : undefined;

  const content = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: childId || fieldId,
        name: children.props.name || name,
        'aria-invalid': children.props['aria-invalid'] ?? Boolean(error),
        'aria-describedby': [children.props['aria-describedby'], hint && !error ? hintId : undefined, error ? errorId : undefined]
          .filter(Boolean)
          .join(' ') || undefined,
      })
    : children;

  return (
    <div className={`w-full min-w-0 space-y-2 ${className}`.trim()}>
      {label ? (
        fieldId ? (
          <label htmlFor={fieldId} className={`block text-sm font-medium text-slate-700 ${labelClassName}`.trim()}>
            <span className="inline-flex items-center gap-1">
              {label}
              {required ? <span className="text-rose-500">*</span> : null}
            </span>
          </label>
        ) : (
          <div className={`block text-sm font-medium text-slate-700 ${labelClassName}`.trim()}>
            <span className="inline-flex items-center gap-1">
              {label}
              {required ? <span className="text-rose-500">*</span> : null}
            </span>
          </div>
        )
      ) : null}
      <div className={`w-full ${contentClassName}`.trim()}>{content}</div>
      {hint && !error ? <p id={hintId} className="text-xs leading-5 text-slate-500">{hint}</p> : null}
      {error ? <p id={errorId} className="text-xs leading-5 text-rose-600">{error}</p> : null}
    </div>
  );
}

FormField.propTypes = {
  label: PropTypes.node,
  children: PropTypes.node,
  hint: PropTypes.node,
  error: PropTypes.node,
  required: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  htmlFor: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
};
