import React from 'react';

export default function ERPFixedSwitch({ checked = false, onChange, label, className = '' }) {
  const handleToggle = () => {
    if (typeof onChange === 'function') {
      onChange(!checked);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      className={`relative inline-flex h-[24px] w-[46px] shrink-0 items-center overflow-hidden rounded-full p-0 focus:outline-none focus:ring-2 focus:ring-emerald-200 ${checked ? 'bg-[#16a34a]' : 'bg-[#D1D5DB]'} ${className}`.trim()}
    >
      <span
        className={`absolute left-[3px] top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-[transform] duration-200 ${checked ? 'translate-x-[22px]' : 'translate-x-0'}`}
      />
    </button>
  );
}
