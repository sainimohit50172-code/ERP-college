export default function SettingsPage() {
  return (
    <div className="rounded-[32px] border border-white/10 bg-slate-900/80 p-8 shadow-soft backdrop-blur-xl">
      <h1 className="text-2xl font-semibold text-white">Settings</h1>
      <p className="mt-2 text-sm text-slate-400">Configure system, security, notifications, and portal preferences.</p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {['Portal access', 'Billing', 'Notifications', 'User roles', 'Security policies', 'Display preferences'].map((option) => (
          <div key={option} className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-sm">
            <p className="text-lg font-semibold text-white">{option}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
