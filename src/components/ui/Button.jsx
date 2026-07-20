
export default function Button({ children, className = '', isLoading = false, disabled = false, onClick, type = 'button', variant = 'primary', ...props }) {
  const base = 'btn hover-gradient-border h-10';
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success'
  }[variant] || 'btn-primary';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`hover-gradient-border ${base} ${variantClass} ${className} ${isLoading ? 'loading' : ''}`}
      style={{ '--hover-gradient-radius': '16px' }}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg>
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
