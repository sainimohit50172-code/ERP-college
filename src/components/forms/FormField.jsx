export default function FormField({ label, children, hint }) {
  return (
    <div className="space-y-3">
      <label className="block">{label}</label>
      {children}
      {hint && <p className="form-help">{hint}</p>}
    </div>
  );
}
