export default function LoadingOverlay({ loading, message = 'Loading...' }) {
  if (!loading) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/70 px-4">
      <div className="flex items-center gap-3 rounded-3xl bg-slate-950/95 px-5 py-4 text-white shadow-soft">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        <span>{message}</span>
      </div>
    </div>
  );
}
