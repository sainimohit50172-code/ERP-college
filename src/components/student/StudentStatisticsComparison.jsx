import { UserCheck, Users, UserX } from 'lucide-react';

const stats = [
  { label: 'Boys', icon: UserCheck, current: '1015', previous: '1123' },
  { label: 'Girls', icon: Users, current: '391', previous: '417' },
  { label: 'Others', icon: UserX, current: '-', previous: '-' },
];

export default function StudentStatisticsComparison() {
  return (
    <div className="rounded-[24px] bg-yellow-100 border border-yellow-300 p-6 shadow-md">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-yellow-700">Student Statistics (Vs. Prev Year)</p>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div></div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">This Session</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-900">Prev Session</p>
        </div>
      </div>

      {/* Stats Rows */}
      <div className="space-y-4">
        {stats.map((item) => (
          <div key={item.label} className="grid grid-cols-3 gap-3 items-center">
            {/* Label with Icon */}
            <div className="flex items-center gap-2">
              <item.icon className="h-5 w-5 text-yellow-600" />
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
            </div>
            {/* Current Session */}
            <div className="bg-yellow-300 rounded-lg px-4 py-3 text-center">
              <p className="text-lg font-bold text-slate-900">{item.current}</p>
            </div>
            {/* Previous Session */}
            <div className="bg-yellow-300 rounded-lg px-4 py-3 text-center">
              <p className="text-lg font-bold text-slate-900">{item.previous}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
