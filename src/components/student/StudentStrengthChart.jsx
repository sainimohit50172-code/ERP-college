import { BarChart, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';

const data = [
  { standard: 'Nursery', strength: 120 },
  { standard: 'Prep', strength: 142 },
  { standard: 'I', strength: 178 },
  { standard: 'II', strength: 186 },
  { standard: 'III', strength: 162 },
  { standard: 'IV', strength: 154 },
  { standard: 'V', strength: 170 },
  { standard: 'VI', strength: 194 },
];

export default function StudentStrengthChart() {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="standard" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }} />
          <Legend />
          <Bar dataKey="strength" fill="#2563eb" radius={[10, 10, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
