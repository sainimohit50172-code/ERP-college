export default function FormField({ label, children, hint }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-200">{label}</label>
      {children}
      {hint && <p className="text-sm text-slate-400">{hint}</p>}
    </div>
  );
}
