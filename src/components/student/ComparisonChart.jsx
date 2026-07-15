import { BarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const data = [
  { name: 'Total Students', current: 1406, previous: 1310 },
  { name: 'Boys', current: 1015, previous: 960 },
  { name: 'Girls', current: 391, previous: 350 },
  { name: 'Inactive Students', current: 0, previous: 8 },
];

export default function ComparisonChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={36} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="current" fill="#2563eb" radius={[8, 8, 0, 0]} animationDuration={900} />
          <Bar dataKey="previous" fill="#94a3b8" radius={[8, 8, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
