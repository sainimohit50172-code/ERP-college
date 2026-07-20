import { useMemo, useState } from 'react';

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'N';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function CircleAvatar({
  src,
  alt = '',
  name = '',
  sizeClass = 'h-8 w-8',
  className = '',
  fallbackClassName = '',
  imageClassName = '',
  ...props
}) {
  const [hasError, setHasError] = useState(false);
  const initials = useMemo(() => getInitials(name || alt), [name, alt]);
  const shouldShowImage = Boolean(src) && !hasError;

  const wrapperClassName = [
    'avatar-circle inline-flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-100 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600',
    sizeClass,
    className,
  ].filter(Boolean).join(' ');

  if (shouldShowImage) {
    return (
      <div className={wrapperClassName}>
        <img
          src={src}
          alt={alt || name || 'profile'}
          className={['h-full w-full object-cover', imageClassName].filter(Boolean).join(' ')}
          loading="lazy"
          onError={() => setHasError(true)}
          {...props}
        />
      </div>
    );
  }

  return (
    <div className={[wrapperClassName, fallbackClassName].filter(Boolean).join(' ')} title={name || alt || 'Profile'}>
      {initials}
    </div>
  );
}
