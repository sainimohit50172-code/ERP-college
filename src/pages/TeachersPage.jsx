export default function TeachersPage() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft backdrop-blur-xl">
      <h1 className="text-2xl font-semibold text-white">Teachers</h1>
      <p className="mt-2 text-sm text-slate-400">Review teacher availability, class assignments, and support capacity.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {['Math', 'Physics', 'English', 'History', 'Biology', 'Computer Science'].map((subject) => (
          <div key={subject} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{subject}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{Math.floor(Math.random() * 15) + 3} teachers</p>
            <p className="mt-3 text-sm text-slate-400">Managed lecture schedules, assessments, and classroom delivery.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
