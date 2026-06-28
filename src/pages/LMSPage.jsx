export default function LMSPage() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft backdrop-blur-xl">
      <h1 className="text-2xl font-semibold text-white">LMS</h1>
      <p className="mt-2 text-sm text-slate-400">Unified learning management for courses, content, notes, and assessments.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {['Course library', 'Live classes', 'Assessments', 'Notes', 'Analytics', 'Classroom resources'].map((item) => (
          <div key={item} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-sm">
            <p className="text-lg font-semibold text-white">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
