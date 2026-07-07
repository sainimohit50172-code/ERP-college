import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm text-slate-500">This is a placeholder page for <strong>{title}</strong>.</p>
    </div>
  );
}
