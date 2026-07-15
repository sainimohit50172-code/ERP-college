import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { label: 'Hindu', value: 690, color: '#0f766e' },
  { label: 'Muslim', value: 304, color: '#3b82f6' },
  { label: 'Sikh', value: 148, color: '#f59e0b' },
  { label: 'Christian', value: 126, color: '#8b5cf6' },
  { label: 'Buddhist', value: 86, color: '#ec4899' },
  { label: 'Others', value: 52, color: '#64748b' },
];

export default function ReligionChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.28)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Religion Wise Student Strength</h3>
          <p className="mt-1 text-sm text-slate-500">Diverse student religious mix</p>
        </div>
      </div>
      <div className="relative mt-3 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={70} outerRadius={108} paddingAngle={2} stroke="none">
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-semibold text-slate-900">{total}</div>
            <div className="text-sm text-slate-500">Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}
