export default function FormField({ label, children, hint }) {
  return (
    <div className="w-full min-w-0 space-y-2">
      <label className="block text-[13px] hover-gradient-border">{label}</label>
      {children}
      {hint && <p className="form-help">{hint}</p>}
    </div>
  );
}
